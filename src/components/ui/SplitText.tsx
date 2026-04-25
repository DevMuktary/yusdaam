"use client";

interface SplitTextProps {
  text: string;
  className?: string;
}

export function SplitText({ text, className = "" }: SplitTextProps) {
  // Splits by words, then wraps each word in a span with the 'reveal-text' class
  return (
    <span className="inline-block">
      {text.split(" ").map((word, index) => (
        <span key={index} className={`inline-block reveal-text overflow-hidden ${className}`}>
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
}
