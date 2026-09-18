import { COMPANY_WHATSAPP_URL } from "../data/contactChannels";

function WhatsAppMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 fill-current"
    >
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.55 0 .24 5.3.24 11.83c0 2.08.54 4.1 1.57 5.88L.14 24l6.44-1.64a11.8 11.8 0 0 0 5.5 1.4h.01c6.52 0 11.83-5.31 11.83-11.84 0-3.16-1.23-6.13-3.4-8.44Zm-8.44 18.25h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.82.98 1.02-3.72-.23-.38a9.86 9.86 0 0 1-1.51-5.19C2.15 6.39 6.6 1.94 12.08 1.94c2.65 0 5.14 1.03 7.01 2.91a9.85 9.85 0 0 1 2.9 7.02c0 5.48-4.45 9.86-9.91 9.86Zm5.42-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.44-1.5a9.1 9.1 0 0 1-1.69-2.1c-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.09 3.2 5.07 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function WhatsAppFloatingButton() {
  return (
    <a
      href={COMPANY_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Izy Tech Services on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-[88px] right-4 z-[10001] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(0,0,0,0.24)] transition-transform duration-200 hover:scale-105 hover:bg-[#20bd5a] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:bottom-[92px] sm:right-5"
    >
      <WhatsAppMark />
      <span className="sr-only">Start a WhatsApp conversation</span>
    </a>
  );
}