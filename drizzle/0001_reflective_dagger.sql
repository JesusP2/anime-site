CREATE TABLE "anime" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"mal_id" integer NOT NULL,
	"url" varchar,
	"images" json NOT NULL,
	"trailer" json,
	"approved" boolean,
	"titles" json NOT NULL,
	"type" varchar(255),
	"source" varchar(255),
	"episodes" integer,
	"episodes_info" json NOT NULL,
	"status" varchar(255),
	"airing" boolean,
	"aired" json NOT NULL,
	"duration" varchar(255),
	"rating" varchar(255),
	"score" numeric,
	"scored_by" integer,
	"rank" integer,
	"popularity" integer,
	"members" integer,
	"favorites" integer,
	"synopsis" varchar,
	"background" varchar,
	"season" varchar(255),
	"year" integer,
	"broadcast" json NOT NULL,
	"producers" json NOT NULL,
	"licensors" json NOT NULL,
	"studios" json NOT NULL,
	"genres" json NOT NULL,
	"explicit_genres" json NOT NULL,
	"themes" json NOT NULL,
	"demographics" json NOT NULL,
	"relations" json NOT NULL,
	"theme" json NOT NULL,
	"external" json NOT NULL,
	"streaming" json NOT NULL,
	"characters" json NOT NULL,
	"staff" json NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "anime_mal_id_unique" UNIQUE("mal_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_i_d" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "character" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"mal_id" integer,
	"url" varchar,
	"images" varchar,
	"name" varchar,
	"name_kanji" varchar,
	"nicknames" json,
	"favorites" integer,
	"about" varchar,
	"anime" json,
	"manga" json,
	"voices" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "character_mal_id_unique" UNIQUE("mal_id"),
	CONSTRAINT "character_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "tracked_entity" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"user_type" varchar NOT NULL,
	"entity_status" varchar(255) NOT NULL,
	"mal_id" integer NOT NULL,
	"user_id_mal_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tracked_entity_user_id_mal_id_unique" UNIQUE("user_id_mal_id")
);
--> statement-breakpoint
CREATE TABLE "manga" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"mal_id" integer,
	"url" varchar(255),
	"images" json,
	"approved" boolean,
	"titles" varchar,
	"title_synonyms" json,
	"type" varchar(255),
	"chapters" integer,
	"volumes" integer,
	"status" varchar(255),
	"publishing" boolean,
	"published" boolean,
	"score" integer,
	"scored_by" integer,
	"rank" integer,
	"popularity" integer,
	"members" integer,
	"favorites" integer,
	"synopsis" varchar,
	"background" varchar,
	"authors" json,
	"serializations" json,
	"genres" varchar,
	"explicit_genres" json,
	"themes" varchar,
	"demographics" json,
	"relations" json,
	"external" json,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "manga_mal_id_unique" UNIQUE("mal_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "animeEmbeddingIndex" ON "anime" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "mangaEmbeddingIndex" ON "manga" USING hnsw ("embedding" vector_cosine_ops);