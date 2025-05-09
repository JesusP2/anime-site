import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "./types";
import { messageSchema, responseSchema } from "@repo/shared/schemas/game";
import { ulid } from "ulidx";

export class Game extends DurableObject<Bindings> {
  // sessions: Map<WebSocket, string> = new Map();
  TIMEOUT = 10;
  startedAt: Date | null = null;
  constructor(state: DurableObjectState, env: Bindings) {
    super(state, env);
    this.initializeStorage();
    // this.ctx.getWebSockets().forEach((socket) => {
    //   const metadata = socket.deserializeAttachment();
    //   this.sessions.set(socket, metadata.id);
    // });
  }

  async fetch() {
    const webSocketPair = new WebSocketPair();
    const client = webSocketPair[0];
    const server = webSocketPair[1];
    this.ctx.acceptWebSocket(server);

    const songsLength = 100;
    // max time a game can last
    const time = this.TIMEOUT * 2 * songsLength * 1000;
    this.ctx.storage.setAlarm(new Date(Date.now() + time));
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, messageData: string | ArrayBuffer) {
    if (typeof messageData !== "string") {
      console.error("Received non-string WebSocket message:", messageData);
      ws.close(1011, "Invalid message format");
      return;
    }

    const message = messageSchema.parse(JSON.parse(messageData));
    switch (message.type) {
      case "player_join": {
        this.storePlayerInfo(ws, message.payload);
        this.storeGameInfo(message.payload.songs);
        const currentPlayers = this.fetchPlayersFromDb().map((player, idx) => ({
          ...player,
          isHost: idx === 0,
        }));
        const response = JSON.stringify(
          responseSchema.parse({
            type: "player_join_response",
            payload: currentPlayers,
          }),
        );
        this.getWebSockets().forEach((socket) => {
          socket.send(response);
        });
        break;
      }
      case "game_start": {
        const isHost = this.isHost(ws);
        if (!isHost) {
          console.error("Unauthorized: game_start");
          ws.close(1011, "Unauthorized");
          return;
        }
        const response = JSON.stringify(
          responseSchema.parse({
            type: "game_start_response",
          }),
        );
        this.getWebSockets().forEach((socket) => {
          socket.send(response);
        });
        break;
      }
      case "player_update": {
        const id = ulid();
        const attachment = ws.deserializeAttachment();
        if (!attachment || !attachment.id) {
          console.error("No attachment or attachment ID:", attachment);
          ws.close(1011, "Player not properly joined");
          return;
        }
        this.ctx.storage.sql.exec(
          "INSERT INTO player_guess (id, player_id, song_idx, guess, score) VALUES (?, ?, ?, ?, ?)",
          id,
          attachment.id,
          message.player.songIdx,
          message.player.id,
          message.player.score,
        );
        this.ctx.storage.sql.exec(
          "UPDATE players SET score = score + ? WHERE id = ?",
          message.player.score,
          attachment.id,
        );

        const { songs } = this.ctx.storage.sql
          .exec("SELECT * FROM game_info")
          .one() as { songs: string };
        const parsedSongs = JSON.parse(songs);
        const guesses = this.ctx.storage.sql
          .exec(
            "SELECT * FROM player_guess WHERE song_idx = ?",
            parsedSongs.length - 1,
          )
          .toArray() as { id: string; player_id: string; song_idx: number }[];
        const players = this.fetchPlayersFromDb();
        const didAllPlayersFinished =
          guesses.filter(
            (guess) => !players.some((player) => player.id === guess.player_id),
          ).length === 0;
        if (didAllPlayersFinished) {
          this.ctx.storage.setAlarm(new Date(Date.now() + 1000 * 60));
        }
        this.getWebSockets().forEach((socket) => {
          socket.send(
            JSON.stringify(
              responseSchema.parse({
                type: "player_update_response",
                payload: players,
              }),
            ),
          );
        });
        break;
      }
      case "ping": {
        this.getWebSockets().forEach((socket) => {
          socket.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          );
        });
        break;
      }
      default:
        console.error("Received unknown message type:", message);
        ws.close(1011, "Unknown message type");
    }
  }

  async webSocketClose(ws: WebSocket) {
    console.log("Closing WebSocket:", ws);
    ws.close(1011, "Game closed");
    const attachment = ws.deserializeAttachment();
    if (attachment && attachment.id) {
      this.ctx.storage.sql.exec(
        "UPDATE players SET online = FALSE WHERE id = ?",
        attachment.id,
      );
    }
    if (
      this.getWebSockets().length === 0 ||
      this.ctx.storage.sql
        .exec("SELECT COUNT(*) FROM players WHERE online = TRUE")
        .one()["COUNT(*)"] === 0
    ) {
      console.log(
        "All players disconnected, clearing DB and closing Durable Object.",
      );
      this.ctx.storage.deleteAll();
      this.ctx.storage.deleteAlarm();
    }
  }

  async alarm() {
    console.log("Alarm triggered, clearing DB and closing Durable Object.");
    this.getWebSockets().forEach((socket) => {
      socket.close(1011, "Game closed");
    });
    this.ctx.storage.deleteAll();
    this.ctx.storage.deleteAlarm();
  }

  private getWebSockets() {
    return this.ctx.getWebSockets().filter((socket) => socket.readyState === 1);
  }

  private initializeStorage(): void {
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT, score INTEGER DEFAULT 0, avatar TEXT, online BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS game_info (id TEXT PRIMARY KEY, songs TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
    this.ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS player_guess (id TEXT PRIMARY KEY, player_id TEXT, song_idx INTEGER, guess TEXT, score INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    );
  }

  private fetchPlayersFromDb() {
    const cursor = this.ctx.storage.sql.exec(
      "SELECT players.id, players.name, players.score, players.avatar, player_guess.song_idx FROM players LEFT JOIN player_guess ON players.id = player_guess.player_id WHERE players.online = TRUE ORDER BY players.created_at ASC",
    );
    type Player = {
      id: string;
      name: string;
      score: number;
      avatar?: string;
      song_idx: number;
    };
    const results = cursor.toArray() as (Omit<Player, "avatar"> & {
      avatar: string | null;
    })[];
    const players = [] as (Omit<Player, "song_idx"> & { songIdx: number })[];
    for (const result of results) {
      const idx = players.findIndex((player) => player.id === result.id);
      const player = players[idx];
      if (!player) {
        players.push({
          id: result.id,
          name: result.name,
          score: result.score,
          avatar: result.avatar ?? undefined,
          songIdx: typeof result.song_idx == "number" ? result.song_idx + 1 : 0,
        });
        continue;
      }
      if (player.songIdx < result.song_idx + 1) {
        player.songIdx = result.song_idx + 1;
      }
      continue;
    }
    return players;
  }

  private isHost(ws: WebSocket) {
    const attachment = ws.deserializeAttachment();
    if (!attachment || !attachment.id) {
      return false;
    }
    const player = this.ctx.storage.sql
      .exec(
        "SELECT id FROM players WHERE online = TRUE ORDER BY created_at ASC LIMIT 1",
      )
      .one() as { id: string };
    return player?.id === attachment.id;
  }

  private storePlayerInfo(
    ws: WebSocket,
    { id, name }: { id: string; name: string },
  ) {
    this.ctx.storage.sql.exec(
      "UPDATE players SET online = TRUE WHERE id = ?",
      id,
    );
    this.ctx.storage.sql.exec(
      "INSERT OR IGNORE INTO players (id, name, score, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      id,
      name,
      0,
    );
    ws.serializeAttachment({ id });
  }

  private storeGameInfo(songs: any[]) {
    const [gameInfo] = this.ctx.storage.sql
      .exec("SELECT * FROM game_info")
      .toArray();
    if (!gameInfo || !("id" in gameInfo)) {
      this.ctx.storage.sql.exec(
        "INSERT INTO game_info (id, songs) VALUES (?, ?)",
        ulid(),
        JSON.stringify(songs),
      );
    }
  }

  private getGameStartedAt() {
    if (!this.startedAt) {
      const [gameInfo] = this.ctx.storage.sql
        .exec("SELECT * FROM game_info")
        .toArray() as { started_at: string }[];
      if (!gameInfo) {
        throw new Error("Invalid action");
      }
      this.startedAt = new Date(gameInfo.started_at);
    }
    return this.startedAt;
  }
}
