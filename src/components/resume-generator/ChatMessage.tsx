import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    type: 'system' | 'user';
    content: string;
    timestamp: Date;
  };
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        message.type === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          message.type === 'user'
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-900"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};