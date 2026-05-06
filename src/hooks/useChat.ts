import { useState, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseChatProps {
  tenantId: string;
}

export function useChat({ tenantId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: userMessage.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.trim(),
            sessionId,
            tenantId,
            history: messages, // send full history for context
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        // Save session ID for conversation continuity
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || "Something went wrong");
        // Optional: you might want to keep the user message but show an error state
        // setMessages((prev) => prev.slice(0, -1)); 
      } finally {

        setIsLoading(false);
      }
    },
    [messages, sessionId, tenantId, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat, sessionId };
}
