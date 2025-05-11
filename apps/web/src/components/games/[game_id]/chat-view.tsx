import * as React from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { z } from "zod";
import type { serverChatBroadcastSchema } from "@repo/shared/schemas/game";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = z.infer<typeof serverChatBroadcastSchema>["payload"];
export function ChatView({
  messages,
  onSendMessage,
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}) {
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;
  const scrollAreaViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop =
        scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="lg:w-80 h-[80vh] min-w-[300px] overflow-hidden flex flex-col justify-end mx-6">
      <CardContent
        className="overflow-y-scroll pagination-scrollbar"
        ref={scrollAreaViewportRef}
      >
        <div className="space-y-4 px-1">
          {messages.map((message, index) => (
            <p key={index} className={cn("rounded-lg text-sm break-words")}>
              <span className="text-purple-300 inline">
                {message.senderName}
              </span>
              : {message.text}
            </p>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form className="w-full items-center space-y-2">
          <Textarea
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            rows={1}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (inputLength === 0) return;
                onSendMessage(input);
                setInput("");
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={inputLength === 0}
            onClick={() => onSendMessage(input)}
          >
            <Send className="size-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
