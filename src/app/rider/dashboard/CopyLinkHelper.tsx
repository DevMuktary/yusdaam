"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyLinkHelper({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-2 bg-white/5 hover:bg-cobalt/20 text-gray-400 hover:text-cobalt rounded transition-colors flex items-center justify-center shrink-0"
      title="Copy link to send to guarantor"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );
}
