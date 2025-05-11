import * as React from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { z } from "zod";
import type { serverChatBroadcastSchema } from "@repo/shared/schemas/game";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = z.infer<typeof serverChatBroadcastSchema>['payload'];
export function ChatView({ messages, onSendMessage }: { messages: ChatMessage[], onSendMessage: (text: string) => void }) {
  const [input, setInput] = React.useState("");
  const inputLength = input.trim().length;
  const scrollAreaViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="lg:w-80">
      <CardContent>
        <div className="space-y-4 overflow-x-hidden overflow-y-scroll max-h-[500px] h-screen px-1 pagination-scrollbar" ref={scrollAreaViewportRef}>
          {messages.map((message, index) => (
            <p
              key={index}
              className={cn(
                "rounded-lg text-sm break-words",
              )}>
              <span className="text-purple-300 inline">{message.senderName}</span>: {message.text}
            </p>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (inputLength === 0) return;
            onSendMessage(input);
            setInput("");
          }}
          className="w-full items-center space-y-2">
          <Textarea
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            rows={1}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" size="icon" disabled={inputLength === 0}>
            <Send className="size-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
