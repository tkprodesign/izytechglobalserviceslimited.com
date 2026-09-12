import { MessageCircle, Phone } from "lucide-react";
import {
  COMPANY_PHONE_TEL,
  COMPANY_WHATSAPP_URL,
} from "../data/contactChannels";

interface PhoneActionsProps {
  dark?: boolean;
  className?: string;
}

export function PhoneActions({ dark = false, className = "" }: PhoneActionsProps) {
  const mutedClass = dark ? "text-white/45" : "text-[#041627]/45";
  const callClass = dark
    ? "text-white/75 hover:text-white"
    : "text-[#041627]/70 hover:text-[#041627]";

  return (
    <div className={`flex items-center gap-3 text-xs ${className}`}>
      <a
        href={COMPANY_PHONE_TEL}
        className={`inline-flex items-center gap-1.5 transition-colors ${callClass}`}
      >
        <Phone size={12} />
        Call
      </a>
      <span className={mutedClass} aria-hidden="true">·</span>
      <a
        href={COMPANY_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-[#25D366] transition-colors hover:text-[#1da851]"
      >
        <MessageCircle size={13} />
        WhatsApp
      </a>
    </div>
  );
}