import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  Inbox,
  Mail,
  Menu,
  MoreHorizontal,
  Paperclip,
  PanelRight,
  PenLine,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Settings2,
  Star,
  Tag,
  Trash2,
  UserRound,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Mailbox = {
  id: string;
  label: string;
  address: string;
  short: string;
  color: string;
  unread: number;
  note: string;
};

type Folder = {
  id: "all" | "inbox" | "sent" | "archive";
  label: string;
  icon: LucideIcon;
};

type Message = {
  id: string;
  mailbox: string;
  sender: string;
  address: string;
  initials: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  time: string;
  sent: boolean;
  read: boolean;
  archived: boolean;
  starred: boolean;
  labels: string[];
  tone: "coral" | "blue" | "green" | "gold" | "plum";
  needsReply?: boolean;
  attachment?: string;
  threadCount?: number;
};

const mailboxes: Mailbox[] = [
  { id: "all", label: "All mail", address: "4 connected accounts", short: "ALL", color: "#e57457", unread: 7, note: "One view across IZY" },
  { id: "info", label: "Info", address: "info@izyane.com", short: "IN", color: "#4f8c87", unread: 4, note: "Customer enquiries" },
  { id: "projects", label: "Projects", address: "projects@izyane.com", short: "PR", color: "#6d75b7", unread: 2, note: "Active project threads" },
  { id: "accounts", label: "Accounts", address: "accounts@izyane.com", short: "AC", color: "#c58a43", unread: 1, note: "Invoices and receipts" },
  { id: "hello", label: "Hello IZY", address: "hello@izyane.com", short: "HI", color: "#a06b84", unread: 0, note: "Company correspondence" },
];

const folders: Folder[] = [
  { id: "all", label: "All conversations", icon: Mail },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "archive", label: "Archive", icon: Archive },
];

const starterMessages: Message[] = [
  {
    id: "m1",
    mailbox: "info",
    sender: "Amina Yusuf",
    address: "amina.yusuf@greenfield.ng",
    initials: "AY",
    subject: "Website assessment request",
    preview: "Could we find a time next week for the site assessment at our new Yaba office?",
    body: "Hello IZY team,\n\nWe are ready to move ahead with the new office project and would like to schedule a site assessment at our Yaba location. The space is 240 sqm and we would prefer a morning appointment next week if possible.\n\nCould you share your availability and let us know what we should have ready before the visit?\n\nKind regards,\nAmina",
    date: "Today",
    time: "10:42",
    sent: false,
    read: false,
    archived: false,
    starred: true,
    labels: ["New enquiry", "Site visit"],
    tone: "coral",
    needsReply: true,
    attachment: "Yaba-office-brief.pdf",
  },
  {
    id: "m2",
    mailbox: "projects",
    sender: "Chinedu Okafor",
    address: "chinedu@oakandstone.com",
    initials: "CO",
    subject: "Re: Quote for retail fit-out",
    preview: "Thanks for sending this through. Could we revise the timeline to begin in June?",
    body: "Hi Tobi,\n\nThanks for sending the quote through. The scope looks good from our side. Could we revise the timeline to begin in June instead? We would like to open the store before the school holidays.\n\nPlease let me know if that is workable and whether the change affects the payment schedule.\n\nBest,\nChinedu",
    date: "Yesterday",
    time: "16:18",
    sent: false,
    read: true,
    archived: false,
    starred: false,
    labels: ["Quote", "Waiting on IZY"],
    tone: "blue",
    needsReply: true,
    threadCount: 4,
  },
  {
    id: "m3",
    mailbox: "accounts",
    sender: "Bello & Partners",
    address: "finance@bellopartners.com",
    initials: "BP",
    subject: "Invoice 1048 — payment confirmation",
    preview: "Payment has been processed today. Please find the remittance advice attached.",
    body: "Good afternoon,\n\nPayment for invoice 1048 has been processed today. Please find the remittance advice attached for your records.\n\nThank you for your patience while we closed this out.\n\nRegards,\nBello & Partners Finance",
    date: "Yesterday",
    time: "09:05",
    sent: false,
    read: false,
    archived: false,
    starred: true,
    labels: ["Accounts", "Payment received"],
    tone: "gold",
    attachment: "remittance-1048.pdf",
  },
  {
    id: "m4",
    mailbox: "hello",
    sender: "Adaeze Nwosu",
    address: "adaeze@northstar.ng",
    initials: "AN",
    subject: "Thank you for your proposal",
    preview: "The proposal looks excellent. We will come back to you with feedback shortly.",
    body: "Hi IZY team,\n\nThe proposal looks excellent and the direction feels right for the Northstar office. We will review it internally and come back to you with feedback by Friday.\n\nWarm regards,\nAdaeze",
    date: "14 May",
    time: "14:31",
    sent: false,
    read: true,
    archived: false,
    starred: false,
    labels: ["Proposal", "Waiting"],
    tone: "plum",
  },
  {
    id: "m5",
    mailbox: "info",
    sender: "IZY Studio",
    address: "info@izyane.com",
    initials: "IZ",
    subject: "Re: Your enquiry has been received",
    preview: "We have shared your brief with the studio team and will follow up with next steps.",
    body: "Hello Amina,\n\nThank you for contacting IZY. We have shared your brief with the studio team and will follow up with next steps shortly.\n\nIf you have any floor plans or reference images, you can reply here and we will add them to your enquiry.\n\nBest,\nThe IZY Studio team",
    date: "13 May",
    time: "11:12",
    sent: true,
    read: true,
    archived: false,
    starred: false,
    labels: ["Customer care"],
    tone: "green",
  },
  {
    id: "m6",
    mailbox: "projects",
    sender: "IZY Projects",
    address: "projects@izyane.com",
    initials: "IP",
    subject: "Project handover checklist",
    preview: "The final checklist and completion photos are ready for your review.",
    body: "Hi team,\n\nThe final handover checklist and completion photos are ready for review. Please confirm the outstanding snag items before we share the close-out pack with the client.\n\nThanks,\nIZY Projects",
    date: "12 May",
    time: "17:44",
    sent: true,
    read: true,
    archived: true,
    starred: false,
    labels: ["Handover", "Internal"],
    tone: "blue",
    attachment: "handover-checklist.zip",
  },
  {
    id: "m7",
    mailbox: "accounts",
    sender: "Lagos Business Hub",
    address: "billing@lagosbusinesshub.ng",
    initials: "LB",
    subject: "Your May workspace receipt",
    preview: "Your receipt for the May workspace membership is ready.",
    body: "Hello,\n\nYour receipt for the May workspace membership is ready. Please find a copy attached for your records.\n\nLagos Business Hub",
    date: "10 May",
    time: "08:21",
    sent: false,
    read: true,
    archived: true,
    starred: false,
    labels: ["Receipt"],
    tone: "gold",
    attachment: "may-receipt.pdf",
  },
];

const quickFilters = ["All", "Unread", "Starred", "Needs reply"] as const;
type QuickFilter = (typeof quickFilters)[number];

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ message, size = "medium" }: { message: Message; size?: "small" | "medium" | "large" }) {
  return (
    <div className={`ow-avatar ow-avatar-${size} ow-tone-${message.tone}`} aria-hidden="true">
      {message.initials}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  active = false,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <button type="button" className={`ow-icon-button ${active ? "is-active" : ""} ${className}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function Composer({
  mode,
  message,
  mailboxes: availableMailboxes,
  onClose,
  onSend,
}: {
  mode: "new" | "reply";
  message: Message;
  mailboxes: Mailbox[];
  onClose: () => void;
  onSend: (recipient: string, subject: string, body: string, mailboxId: string) => void;
}) {
  const defaultRecipient = mode === "reply" ? message.address : "";
  const defaultSubject = mode === "reply" ? `Re: ${message.subject.replace(/^Re:\s*/i, "")}` : "";
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(mode === "reply" ? `Hi ${message.sender.split(" ")[0]},\n\n` : "");
  const [mailboxId, setMailboxId] = useState(availableMailboxes[1]?.id || availableMailboxes[0].id);
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!recipient.trim() || !subject.trim() || !body.trim()) return;
    onSend(recipient, subject, body, mailboxId);
    setSent(true);
    window.setTimeout(onClose, 650);
  }

  return (
    <div className="ow-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="ow-composer" aria-label={mode === "reply" ? "Reply to message" : "Compose email"} onMouseDown={(event) => event.stopPropagation()}>
        <div className="ow-composer-head">
          <div>
            <div className="ow-eyebrow">Dispatch desk</div>
            <h2>{mode === "reply" ? "Reply to customer" : "New message"}</h2>
          </div>
          <IconButton label="Close composer" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <form className="ow-composer-form" onSubmit={submit}>
          <label>
            <span>From</span>
            <select value={mailboxId} onChange={(event) => setMailboxId(event.target.value)}>
              {availableMailboxes.filter((mailbox) => mailbox.id !== "all").map((mailbox) => (
                <option key={mailbox.id} value={mailbox.id}>{mailbox.label} · {mailbox.address}</option>
              ))}
            </select>
          </label>
          <label>
            <span>To</span>
            <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="customer@example.com" type="email" autoFocus={mode === "new"} />
          </label>
          <label>
            <span>Subject</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What needs a clear answer?" />
          </label>
          <label className="ow-message-field">
            <span>Message</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a concise, human reply…" />
          </label>
          <div className="ow-composer-tools">
            <button type="button" className="ow-text-button" onClick={() => setBody((current) => `${current}\n\nBest,\nTobi`)}><Paperclip size={15} /> Add signature</button>
            <span>{body.length} characters</span>
          </div>
          <div className="ow-composer-foot">
            <button type="button" className="ow-quiet-button" onClick={onClose}>Discard</button>
            <button className="ow-send-button" type="submit" disabled={sent}>
              {sent ? <Check size={16} /> : <Send size={16} />}
              {sent ? "Sent" : "Send message"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export function Overhaul() {
  const [activeMailboxId, setActiveMailboxId] = useState("all");
  const [activeFolder, setActiveFolder] = useState<Folder["id"]>("inbox");
  const [messages, setMessages] = useState(starterMessages);
  const [selectedId, setSelectedId] = useState("m1");
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("All");
  const [composer, setComposer] = useState<"new" | "reply" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [refreshed, setRefreshed] = useState(false);
  const [toast, setToast] = useState("");

  const activeMailbox = mailboxes.find((mailbox) => mailbox.id === activeMailboxId) || mailboxes[0];
  const selected = messages.find((message) => message.id === selectedId) || messages[0];

  const visibleMessages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages.filter((message) => {
      const mailboxMatch = activeMailboxId === "all" || message.mailbox === activeMailboxId;
      const folderMatch =
        activeFolder === "all" ||
        (activeFolder === "inbox" && !message.sent && !message.archived) ||
        (activeFolder === "sent" && message.sent) ||
        (activeFolder === "archive" && message.archived);
      const filterMatch =
        quickFilter === "All" ||
        (quickFilter === "Unread" && !message.read) ||
        (quickFilter === "Starred" && message.starred) ||
        (quickFilter === "Needs reply" && message.needsReply);
      const searchMatch =
        !needle ||
        `${message.sender} ${message.address} ${message.subject} ${message.preview} ${message.labels.join(" ")}`
          .toLowerCase()
          .includes(needle);
      return mailboxMatch && folderMatch && filterMatch && searchMatch;
    });
  }, [activeFolder, activeMailboxId, messages, quickFilter, query]);

  const unreadCount = messages.filter((message) => !message.read && !message.archived && !message.sent).length;
  const replyCount = messages.filter((message) => message.needsReply && !message.archived).length;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openMessage(message: Message) {
    setSelectedId(message.id);
    setMobileDetail(true);
    if (!message.read) {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read: true } : item));
    }
  }

  function toggleStar(id: string) {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, starred: !message.starred } : message));
  }

  function toggleArchive(id: string) {
    const target = messages.find((message) => message.id === id);
    if (!target) return;
    setMessages((current) => current.map((message) => message.id === id ? { ...message, archived: !message.archived } : message));
    showToast(target.archived ? "Conversation restored to inbox" : "Conversation archived");
    if (!target.archived) {
      const next = visibleMessages.find((message) => message.id !== id);
      if (next) setSelectedId(next.id);
    }
  }

  function markNeedsReply(id: string) {
    setMessages((current) => current.map((message) => message.id === id ? { ...message, needsReply: !message.needsReply } : message));
    showToast(selected.needsReply ? "Follow-up cleared" : "Added to follow-up queue");
  }

  function sendMessage(recipient: string, subject: string, body: string, mailboxId: string) {
    const mailbox = mailboxes.find((item) => item.id === mailboxId) || mailboxes[1];
    const outgoing: Message = {
      id: `sent-${Date.now()}`,
      mailbox: mailbox.id,
      sender: "Tobi from IZY",
      address: mailbox.address,
      initials: "TI",
      subject,
      preview: body.replace(/\s+/g, " ").trim().slice(0, 100),
      body,
      date: "Just now",
      time: "Now",
      sent: true,
      read: true,
      archived: false,
      starred: false,
      labels: ["Sent"],
      tone: "green",
    };
    setMessages((current) => [outgoing, ...current]);
    setSelectedId(outgoing.id);
    showToast(`Message sent from ${mailbox.label}`);
  }

  function refresh() {
    setRefreshed(true);
    window.setTimeout(() => setRefreshed(false), 800);
    showToast("Mailboxes checked just now");
  }

  return (
    <div className="email-overhaul">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600&display=swap');
        .email-overhaul, .email-overhaul * { box-sizing: border-box; }
        .email-overhaul {
          --ink: #152b35;
          --ink-soft: #3d555b;
          --muted: #829196;
          --line: #dfe6e4;
          --paper: #f5f4ef;
          --white: #fbfbf8;
          --coral: #e57457;
          --coral-dark: #bd5d47;
          --mint: #dcebe5;
          --teal: #4f8c87;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          color: var(--ink);
          background: #dce3df;
          font-family: "DM Sans", sans-serif;
          letter-spacing: -0.01em;
        }
        .email-overhaul button, .email-overhaul input, .email-overhaul textarea, .email-overhaul select { font: inherit; }
        .email-overhaul button { cursor: pointer; }
        .ow-shell { display: grid; grid-template-columns: 238px minmax(300px, 380px) minmax(420px, 1fr); min-height: 100dvh; max-height: 100dvh; }
        .ow-rail { display: flex; flex-direction: column; padding: 22px 15px 16px; background: var(--ink); color: #f0f5f0; }
        .ow-brand { display: flex; align-items: center; gap: 11px; padding: 0 10px 23px; border-bottom: 1px solid rgba(227,239,233,.13); }
        .ow-brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid rgba(255,255,255,.25); border-radius: 11px; color: var(--ink); background: var(--coral); font: 700 11px/1 "DM Mono", monospace; letter-spacing: .04em; }
        .ow-brand strong { display: block; font-size: 14px; letter-spacing: -.02em; }
        .ow-brand span { display: block; margin-top: 3px; color: #91aaa5; font-size: 10px; }
        .ow-rail-label, .ow-eyebrow { color: #92aaa6; font: 500 10px/1.2 "DM Mono", monospace; letter-spacing: .12em; text-transform: uppercase; }
        .ow-rail-label { padding: 24px 10px 8px; }
        .ow-rail-nav { display: grid; gap: 3px; }
        .ow-rail-button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 10px; border: 0; border-radius: 9px; color: #c1cfca; background: transparent; text-align: left; font-size: 12px; transition: background .18s, color .18s, transform .18s; }
        .ow-rail-button:hover { color: #f9fbf7; background: rgba(255,255,255,.07); transform: translateX(2px); }
        .ow-rail-button.is-active { color: #fff6f0; background: rgba(229,116,87,.18); }
        .ow-rail-button .ow-count { margin-left: auto; color: #93aaa5; font: 11px "DM Mono", monospace; }
        .ow-rail-button.is-active .ow-count { color: var(--coral); }
        .ow-mailbox { display: flex; align-items: center; gap: 9px; width: 100%; padding: 8px 10px; border: 0; border-radius: 9px; color: #b8c9c3; background: transparent; text-align: left; transition: background .18s, color .18s; }
        .ow-mailbox:hover { color: white; background: rgba(255,255,255,.07); }
        .ow-mailbox.is-active { color: #fff; background: rgba(255,255,255,.09); }
        .ow-mailbox-dot { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; }
        .ow-mailbox-copy { min-width: 0; flex: 1; }
        .ow-mailbox-copy strong, .ow-mailbox-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ow-mailbox-copy strong { font-size: 12px; font-weight: 600; }
        .ow-mailbox-copy span { margin-top: 2px; color: #7f9994; font-size: 10px; }
        .ow-mailbox.is-active .ow-mailbox-copy span { color: #a9bbb5; }
        .ow-mailbox-unread { color: var(--coral); font: 11px "DM Mono", monospace; }
        .ow-rail-bottom { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(227,239,233,.13); }
        .ow-user { display: flex; align-items: center; gap: 9px; padding: 9px 10px 11px; }
        .ow-user-avatar { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; color: var(--ink); background: #e6c9a7; font-size: 11px; font-weight: 700; }
        .ow-user strong { display: block; color: #eaf0ec; font-size: 11px; font-weight: 600; }
        .ow-user span { display: block; margin-top: 2px; color: #88a19b; font-size: 10px; }
        .ow-rail-footer { display: flex; align-items: center; justify-content: space-between; padding: 4px 9px 0; color: #7f9994; font-size: 10px; }
        .ow-rail-footer button { display: inline-grid; place-items: center; padding: 4px; border: 0; color: inherit; background: none; }
        .ow-list { min-width: 0; display: flex; flex-direction: column; border-right: 1px solid #d7e0dc; background: var(--paper); }
        .ow-list-top { padding: 22px 19px 15px; border-bottom: 1px solid var(--line); }
        .ow-list-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .ow-list-heading h1 { margin: 4px 0 0; color: var(--ink); font-size: 22px; line-height: 1; letter-spacing: -.06em; }
        .ow-list-heading p { margin: 7px 0 0; color: var(--muted); font-size: 11px; }
        .ow-top-actions { display: flex; gap: 4px; }
        .ow-icon-button { display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 8px; color: #728287; background: transparent; transition: background .18s, color .18s, transform .18s; }
        .ow-icon-button:hover { color: var(--ink); background: #e7ece9; transform: translateY(-1px); }
        .ow-icon-button.is-active { color: var(--coral-dark); background: #f5e0d9; }
        .ow-search { position: relative; margin-top: 18px; }
        .ow-search > svg { position: absolute; left: 12px; top: 50%; color: #90a0a1; transform: translateY(-50%); }
        .ow-search input { width: 100%; height: 38px; padding: 0 34px 0 35px; border: 1px solid #d8e1de; border-radius: 9px; outline: 0; color: var(--ink); background: #fbfbf8; font-size: 12px; transition: border .18s, box-shadow .18s; }
        .ow-search input::placeholder { color: #9aa7a6; }
        .ow-search input:focus { border-color: var(--coral); box-shadow: 0 0 0 3px rgba(229,116,87,.14); }
        .ow-search > button { position: absolute; right: 7px; top: 7px; display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 6px; color: #879694; background: transparent; }
        .ow-filter-row { display: flex; gap: 5px; margin-top: 13px; overflow-x: auto; scrollbar-width: none; }
        .ow-filter-row::-webkit-scrollbar { display: none; }
        .ow-filter { flex: 0 0 auto; padding: 6px 9px; border: 1px solid transparent; border-radius: 7px; color: #7d8d8e; background: transparent; font-size: 10px; white-space: nowrap; }
        .ow-filter:hover { color: var(--ink); background: #e9eeeb; }
        .ow-filter.is-active { border-color: #e7b3a4; color: var(--coral-dark); background: #f9e9e4; font-weight: 600; }
        .ow-list-meta { display: flex; align-items: center; justify-content: space-between; padding: 12px 19px 8px; color: #879695; font: 10px "DM Mono", monospace; }
        .ow-list-meta button { display: flex; align-items: center; gap: 5px; padding: 0; border: 0; color: #6e8383; background: transparent; font: inherit; }
        .ow-list-meta button:hover { color: var(--coral-dark); }
        .ow-messages { flex: 1; overflow-y: auto; }
        .ow-message-row { position: relative; display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 14px 18px 13px 19px; border: 0; border-top: 1px solid rgba(215,224,220,.7); color: var(--ink); background: transparent; text-align: left; transition: background .16s, border .16s; }
        .ow-message-row:hover { background: #fbfbf8; }
        .ow-message-row.is-selected { border-left: 3px solid var(--coral); padding-left: 16px; background: #fbfbf8; box-shadow: inset 0 1px 0 #fff; }
        .ow-row-main { min-width: 0; flex: 1; }
        .ow-row-top { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
        .ow-row-sender { overflow: hidden; color: #35505a; font-size: 12px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
        .ow-message-row:not(.is-read) .ow-row-sender { color: var(--ink); font-weight: 700; }
        .ow-row-time { flex: 0 0 auto; color: #95a3a1; font: 10px "DM Mono", monospace; }
        .ow-row-subject { display: flex; align-items: center; gap: 5px; margin-top: 4px; color: #3f555b; font-size: 12px; font-weight: 500; }
        .ow-message-row:not(.is-read) .ow-row-subject { color: var(--ink); font-weight: 700; }
        .ow-row-subject span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ow-row-preview { display: -webkit-box; overflow: hidden; margin-top: 4px; color: #899795; font-size: 11px; line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .ow-row-bottom { display: flex; align-items: center; gap: 5px; margin-top: 8px; }
        .ow-tag { display: inline-flex; align-items: center; max-width: 115px; overflow: hidden; padding: 3px 6px; border-radius: 5px; color: #6a7b7b; background: #e8eeea; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
        .ow-tag.coral { color: #a34e3b; background: #f6dfd8; }
        .ow-tag.blue { color: #55639c; background: #e5e7f3; }
        .ow-tag.gold { color: #96682b; background: #f5e9cf; }
        .ow-row-star { flex: 0 0 auto; padding: 2px 0 0; border: 0; color: #bcc6c1; background: transparent; }
        .ow-row-star.is-starred { color: #d39b3d; }
        .ow-row-star:hover { color: #d39b3d; }
        .ow-empty { display: grid; place-items: center; height: 230px; padding: 30px; color: var(--muted); text-align: center; }
        .ow-empty strong { display: block; margin-top: 10px; color: var(--ink-soft); font-size: 12px; }
        .ow-empty span { display: block; margin-top: 4px; font-size: 11px; }
        .ow-reading { min-width: 0; display: flex; flex-direction: column; background: var(--white); }
        .ow-reading-bar { display: flex; align-items: center; justify-content: space-between; min-height: 71px; padding: 17px 25px; border-bottom: 1px solid var(--line); }
        .ow-reading-bar p { margin: 3px 0 0; color: var(--muted); font-size: 11px; }
        .ow-reading-actions { display: flex; align-items: center; gap: 4px; }
        .ow-reading-content { position: relative; flex: 1; overflow-y: auto; padding: 31px clamp(22px, 4vw, 58px) 48px; }
        .ow-message-heading { max-width: 770px; margin: 0 auto; }
        .ow-message-heading-top { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
        .ow-message-heading h2 { max-width: 680px; margin: 8px 0 0; color: var(--ink); font-size: clamp(22px, 2.4vw, 31px); line-height: 1.1; letter-spacing: -.06em; }
        .ow-message-date { color: #829091; font: 10px "DM Mono", monospace; white-space: nowrap; }
        .ow-message-from { display: flex; align-items: center; gap: 11px; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line); }
        .ow-avatar { display: grid; place-items: center; flex: 0 0 auto; border-radius: 11px; color: white; font-weight: 700; letter-spacing: -.04em; }
        .ow-avatar-small { width: 25px; height: 25px; border-radius: 8px; font-size: 9px; }
        .ow-avatar-medium { width: 36px; height: 36px; font-size: 11px; }
        .ow-avatar-large { width: 45px; height: 45px; border-radius: 13px; font-size: 13px; }
        .ow-tone-coral { background: #d8785f; }
        .ow-tone-blue { background: #6874ad; }
        .ow-tone-green { background: #57918a; }
        .ow-tone-gold { background: #b78a4b; }
        .ow-tone-plum { background: #996c82; }
        .ow-from-copy { min-width: 0; }
        .ow-from-copy strong { display: block; color: var(--ink); font-size: 12px; font-weight: 700; }
        .ow-from-copy span { display: block; margin-top: 3px; overflow: hidden; color: #879694; font: 10px "DM Mono", monospace; text-overflow: ellipsis; white-space: nowrap; }
        .ow-from-copy em { color: #9baba7; font: normal 10px "DM Sans", sans-serif; }
        .ow-body-card { max-width: 690px; margin: 28px auto 0; }
        .ow-body-card p { margin: 0 0 17px; color: #40575d; font-size: 14px; line-height: 1.75; white-space: pre-line; }
        .ow-body-card p:last-child { margin-bottom: 0; }
        .ow-body-card .ow-greeting { color: var(--ink); font-weight: 600; }
        .ow-attachment { display: flex; align-items: center; gap: 10px; max-width: 340px; margin-top: 27px; padding: 11px 12px; border: 1px solid #d9e2dd; border-radius: 9px; background: #f1f5f1; }
        .ow-attachment svg { color: var(--coral-dark); }
        .ow-attachment strong { display: block; color: var(--ink); font-size: 11px; font-weight: 600; }
        .ow-attachment span { display: block; margin-top: 2px; color: #91a09d; font-size: 10px; }
        .ow-inline-reply { display: flex; align-items: center; gap: 10px; max-width: 690px; margin: 38px auto 0; padding-top: 20px; border-top: 1px solid var(--line); }
        .ow-inline-reply button { display: inline-flex; align-items: center; gap: 7px; padding: 9px 12px; border: 1px solid #d5dfda; border-radius: 8px; color: var(--ink-soft); background: #f7f8f4; font-size: 11px; font-weight: 600; transition: background .18s, border .18s, color .18s; }
        .ow-inline-reply button:hover { border-color: #e2b0a1; color: var(--coral-dark); background: #fff4ef; }
        .ow-inline-reply span { color: #98a6a3; font-size: 10px; }
        .ow-context { position: absolute; top: 27px; right: clamp(22px, 3vw, 42px); width: 214px; padding: 0 0 20px 18px; border-left: 1px solid var(--line); background: #f4f6f1; }
        @media (min-width: 1181px) {
          .ow-message-heading, .ow-body-card, .ow-inline-reply { max-width: calc(100% - 250px); margin-left: 0; margin-right: 250px; }
          .ow-context { padding-top: 0; }
        }
        .ow-context h3 { margin: 0; color: var(--ink); font-size: 12px; letter-spacing: -.02em; }
        .ow-context-intro { margin: 5px 0 20px; color: var(--muted); font-size: 10px; line-height: 1.45; }
        .ow-context-person { display: flex; align-items: center; gap: 9px; padding-bottom: 17px; border-bottom: 1px solid var(--line); }
        .ow-context-person strong { display: block; overflow: hidden; color: var(--ink); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
        .ow-context-person span { display: block; overflow: hidden; margin-top: 3px; color: var(--muted); font: 9px "DM Mono", monospace; text-overflow: ellipsis; white-space: nowrap; }
        .ow-context-block { padding: 17px 0; border-bottom: 1px solid var(--line); }
        .ow-context-label { display: flex; align-items: center; gap: 6px; color: #849492; font: 10px "DM Mono", monospace; text-transform: uppercase; letter-spacing: .08em; }
        .ow-context-block p { margin: 8px 0 0; color: #496066; font-size: 11px; line-height: 1.5; }
        .ow-context-link { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 11px; padding: 0; border: 0; color: var(--coral-dark); background: none; font-size: 10px; font-weight: 600; text-align: left; }
        .ow-context-link:hover { color: var(--ink); }
        .ow-context-actions { display: grid; gap: 6px; margin-top: 17px; }
        .ow-context-actions button { display: flex; align-items: center; gap: 7px; padding: 8px 0; border: 0; color: #748684; background: transparent; font-size: 10px; text-align: left; }
        .ow-context-actions button:hover { color: var(--coral-dark); }
        .ow-drawer-backdrop { position: fixed; z-index: 20; inset: 0; display: flex; justify-content: flex-end; background: rgba(14,32,38,.34); animation: ow-fade .18s ease-out; }
        .ow-composer { display: flex; flex-direction: column; width: min(450px, 100%); height: 100%; border-left: 1px solid rgba(21,43,53,.12); background: var(--white); box-shadow: -20px 0 50px rgba(31,55,57,.16); animation: ow-slide .22s ease-out; }
        .ow-composer-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px 25px 18px; border-bottom: 1px solid var(--line); }
        .ow-composer-head h2 { margin: 6px 0 0; color: var(--ink); font: 600 24px/1.05 "Fraunces", serif; letter-spacing: -.04em; }
        .ow-composer-form { display: flex; flex: 1; flex-direction: column; min-height: 0; padding: 22px 25px 18px; }
        .ow-composer-form label { display: block; margin-bottom: 14px; }
        .ow-composer-form label > span { display: block; margin-bottom: 6px; color: #82918f; font: 10px "DM Mono", monospace; letter-spacing: .08em; text-transform: uppercase; }
        .ow-composer-form input, .ow-composer-form select, .ow-composer-form textarea { width: 100%; border: 1px solid #d7e1dd; border-radius: 8px; outline: 0; color: var(--ink); background: #f7f8f4; font-size: 12px; transition: border .18s, box-shadow .18s; }
        .ow-composer-form input, .ow-composer-form select { height: 38px; padding: 0 10px; }
        .ow-composer-form textarea { flex: 1; min-height: 210px; padding: 12px 10px; resize: none; line-height: 1.6; }
        .ow-composer-form input:focus, .ow-composer-form select:focus, .ow-composer-form textarea:focus { border-color: var(--coral); box-shadow: 0 0 0 3px rgba(229,116,87,.14); }
        .ow-message-field { display: flex !important; flex: 1; flex-direction: column; min-height: 0; }
        .ow-composer-tools { display: flex; align-items: center; justify-content: space-between; padding: 4px 0 14px; color: #99a5a2; font-size: 10px; }
        .ow-text-button { display: inline-flex; align-items: center; gap: 5px; padding: 0; border: 0; color: #758582; background: transparent; font-size: 10px; }
        .ow-text-button:hover { color: var(--coral-dark); }
        .ow-composer-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-top: 14px; border-top: 1px solid var(--line); }
        .ow-quiet-button { padding: 8px 12px; border: 0; border-radius: 8px; color: #738380; background: transparent; font-size: 11px; font-weight: 600; }
        .ow-quiet-button:hover { color: var(--ink); background: #edf1ed; }
        .ow-send-button { display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; border: 0; border-radius: 8px; color: #fffaf5; background: var(--coral); font-size: 11px; font-weight: 700; transition: background .18s, transform .18s; }
        .ow-send-button:hover { background: var(--coral-dark); transform: translateY(-1px); }
        .ow-send-button:disabled { opacity: .8; cursor: default; }
        .ow-toast { position: fixed; z-index: 30; right: 24px; bottom: 22px; display: flex; align-items: center; gap: 8px; padding: 11px 14px; border: 1px solid #cbded7; border-radius: 9px; color: #315d56; background: #e9f3ee; box-shadow: 0 12px 30px rgba(42,76,68,.12); font-size: 11px; font-weight: 600; animation: ow-toast-in .22s ease-out; }
        @keyframes ow-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ow-slide { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes ow-toast-in { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 1180px) {
          .ow-shell { grid-template-columns: 204px minmax(294px, 350px) minmax(390px, 1fr); }
          .ow-context { display: none; }
        }
        @media (max-width: 800px) {
          .ow-shell { display: block; min-height: 100dvh; max-height: none; }
          .ow-rail { position: absolute; z-index: 10; top: 0; bottom: 0; left: 0; width: min(290px, 86vw); box-shadow: 14px 0 30px rgba(13,33,38,.18); transform: translateX(-102%); transition: transform .22s ease-out; }
          .ow-rail.is-open { transform: translateX(0); }
          .ow-list { min-height: 100dvh; border-right: 0; }
          .ow-reading { min-height: 100dvh; }
          .ow-mobile-top { display: flex !important; }
          .ow-list-top { padding-top: 15px; }
          .ow-reading-bar { padding: 14px 18px; }
          .ow-reading-content { padding: 25px 20px 38px; }
        }
        @media (min-width: 801px) { .ow-mobile-top { display: none !important; } }
        @media (max-width: 570px) {
          .ow-reading { display: none; }
          .ow-list.is-detail-hidden { display: none; }
          .ow-shell.mobile-detail .ow-list { display: none; }
          .ow-shell.mobile-detail .ow-reading { display: flex; }
          .ow-mobile-back { display: inline-flex !important; }
          .ow-reading-content { padding: 21px 16px 30px; }
          .ow-message-heading h2 { font-size: 24px; }
          .ow-message-date { align-self: flex-start; }
          .ow-message-heading-top { align-items: flex-start; flex-direction: column; gap: 6px; }
        }
        .ow-mobile-top { align-items: center; gap: 9px; margin-bottom: 12px; }
        .ow-mobile-top button { display: inline-grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 8px; color: var(--ink-soft); background: #e8eeeb; }
        .ow-mobile-top strong { color: var(--ink); font-size: 12px; }
        .ow-mobile-back { display: none; align-items: center; gap: 5px; padding: 0; border: 0; color: var(--coral-dark); background: transparent; font-size: 11px; font-weight: 600; }
      `}</style>

      <div className={`ow-shell ${mobileDetail ? "mobile-detail" : ""}`}>
        <aside className={`ow-rail ${sidebarOpen ? "is-open" : ""}`}>
          <div className="ow-brand">
            <div className="ow-brand-mark">IZY</div>
            <div><strong>Operations desk</strong><span>Customer mail, kept moving.</span></div>
          </div>

          <div className="ow-rail-label">Workspace</div>
          <nav className="ow-rail-nav" aria-label="Mail folders">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const count = folder.id === "inbox" ? unreadCount : folder.id === "all" ? messages.length : undefined;
              return (
                <button
                  key={folder.id}
                  type="button"
                  className={`ow-rail-button ${activeFolder === folder.id ? "is-active" : ""}`}
                  onClick={() => { setActiveFolder(folder.id); setSidebarOpen(false); setMobileDetail(false); }}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  <span>{folder.label}</span>
                  {count !== undefined && <span className="ow-count">{count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="ow-rail-label">Mailboxes</div>
          <div className="ow-rail-nav">
            {mailboxes.map((mailbox) => (
              <button
                key={mailbox.id}
                type="button"
                className={`ow-mailbox ${activeMailboxId === mailbox.id ? "is-active" : ""}`}
                onClick={() => { setActiveMailboxId(mailbox.id); setSidebarOpen(false); setMobileDetail(false); }}
              >
                <span className="ow-mailbox-dot" style={{ background: mailbox.color }} />
                <span className="ow-mailbox-copy"><strong>{mailbox.label}</strong><span>{mailbox.address}</span></span>
                {mailbox.unread > 0 && <span className="ow-mailbox-unread">{mailbox.unread}</span>}
              </button>
            ))}
          </div>

          <div className="ow-rail-bottom">
            <div className="ow-user">
              <div className="ow-user-avatar">T</div>
              <div><strong>Tobi Akinyemi</strong><span>Owner · IZY Technologies</span></div>
            </div>
            <div className="ow-rail-footer"><span>Last checked 2m ago</span><button type="button" aria-label="Open settings" title="Settings"><Settings2 size={14} /></button></div>
          </div>
        </aside>

        <section className="ow-list" aria-label="Conversation list">
          <div className="ow-list-top">
            <div className="ow-mobile-top">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open mailbox menu"><Menu size={16} /></button>
              <strong>IZY mail</strong>
            </div>
            <div className="ow-list-heading">
              <div>
                <div className="ow-eyebrow">{activeMailbox.note}</div>
                <h1>{activeMailbox.label}</h1>
                <p>{activeFolder === "inbox" ? "Keep the next customer answer visible." : folders.find((folder) => folder.id === activeFolder)?.label}</p>
              </div>
              <div className="ow-top-actions">
                <IconButton label="Refresh mail" onClick={refresh} className={refreshed ? "is-active" : ""}><RefreshCw size={15} className={refreshed ? "ow-spin" : ""} /></IconButton>
                <IconButton label="Compose new message" onClick={() => setComposer("new")}><PenLine size={16} /></IconButton>
              </div>
            </div>
            <div className="ow-search">
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, subjects, labels…" aria-label="Search messages" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}
            </div>
            <div className="ow-filter-row" aria-label="Quick filters">
              {quickFilters.map((filter) => (
                <button key={filter} type="button" className={`ow-filter ${quickFilter === filter ? "is-active" : ""}`} onClick={() => setQuickFilter(filter)}>
                  {filter}{filter === "Unread" && ` · ${unreadCount}`}{filter === "Needs reply" && ` · ${replyCount}`}
                </button>
              ))}
            </div>
          </div>

          <div className="ow-list-meta">
            <span>{visibleMessages.length} {visibleMessages.length === 1 ? "conversation" : "conversations"}</span>
            <button type="button" onClick={() => setQuickFilter("Needs reply")}><Filter size={12} /> Triage view <ChevronDown size={11} /></button>
          </div>
          <div className="ow-messages">
            {visibleMessages.length === 0 ? (
              <div className="ow-empty"><div><CheckCircle2 size={28} color="#8db0a2" /><strong>Nothing waiting here</strong><span>Try another mailbox or clear the quick filter.</span></div></div>
            ) : visibleMessages.map((message) => (
              <div key={message.id} className={`ow-message-row ${selectedId === message.id ? "is-selected" : ""} ${message.read ? "is-read" : ""}`} role="button" tabIndex={0} onClick={() => openMessage(message)} onKeyDown={(event) => { if (event.key === "Enter") openMessage(message); }}>
                <Avatar message={message} size="small" />
                <div className="ow-row-main">
                  <div className="ow-row-top"><span className="ow-row-sender">{message.sent ? `To ${message.address.split("@")[0]}` : message.sender}</span><span className="ow-row-time">{message.time}</span></div>
                  <div className="ow-row-subject"><span>{message.subject}</span>{message.threadCount && <span style={{ color: "#93a19d", font: '10px "DM Mono", monospace' }}>+{message.threadCount}</span>}</div>
                  <div className="ow-row-preview">{message.preview}</div>
                  <div className="ow-row-bottom">
                    {message.labels.slice(0, 2).map((label, index) => <span key={label} className={`ow-tag ${index === 0 && message.tone === "coral" ? "coral" : index === 0 && message.tone === "blue" ? "blue" : index === 0 && message.tone === "gold" ? "gold" : ""}`}>{label}</span>)}
                    {message.needsReply && <span className="ow-tag coral">Needs reply</span>}
                  </div>
                </div>
                <button type="button" className={`ow-row-star ${message.starred ? "is-starred" : ""}`} onClick={(event) => { event.stopPropagation(); toggleStar(message.id); }} aria-label={message.starred ? "Remove star" : "Star conversation"} title={message.starred ? "Remove star" : "Star conversation"}>
                  <Star size={14} fill={message.starred ? "currentColor" : "none"} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <main className="ow-reading" aria-label="Message reading pane">
          <div className="ow-reading-bar">
            <div>
              <div className="ow-eyebrow">Conversation</div>
              <p>{selected.threadCount ? `${selected.threadCount} messages · ` : ""}{selected.mailbox === "info" ? "Info mailbox" : mailboxes.find((mailbox) => mailbox.id === selected.mailbox)?.label} · {selected.sent ? "Sent by IZY" : "Customer received"}</p>
            </div>
            <div className="ow-reading-actions">
              <button type="button" className="ow-mobile-back" onClick={() => setMobileDetail(false)}><ArrowLeft size={14} /> Back to list</button>
              <IconButton label={selected.starred ? "Remove star" : "Star conversation"} active={selected.starred} onClick={() => toggleStar(selected.id)}><Star size={16} fill={selected.starred ? "currentColor" : "none"} /></IconButton>
              <IconButton label={selected.archived ? "Restore conversation" : "Archive conversation"} onClick={() => toggleArchive(selected.id)}>{selected.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}</IconButton>
              <IconButton label="More message actions" onClick={() => showToast("More actions are available in the conversation menu")}><MoreHorizontal size={17} /></IconButton>
            </div>
          </div>
          <div className="ow-reading-content">
            <div className="ow-message-heading">
              <div className="ow-message-heading-top">
                <div>
                  <div className="ow-eyebrow">{selected.needsReply ? "Follow-up needed" : selected.sent ? "Sent from IZY" : "Customer message"}</div>
                  <h2>{selected.subject}</h2>
                </div>
                <span className="ow-message-date">{selected.date} · {selected.time} WAT</span>
              </div>
              <div className="ow-message-from">
                <Avatar message={selected} size="medium" />
                <div className="ow-from-copy"><strong>{selected.sender}</strong><span>{selected.address} <em>to {selected.sent ? "customer" : "IZY Technologies"}</em></span></div>
                <button type="button" className="ow-icon-button" style={{ marginLeft: "auto" }} aria-label="Show sender details" title="Show sender details" onClick={() => setContextOpen((open) => !open)}><PanelRight size={15} /></button>
              </div>
            </div>
            <div className="ow-body-card">
              {selected.body.split("\n\n").map((paragraph, index) => <p key={`${selected.id}-${index}`} className={index === 0 ? "ow-greeting" : ""}>{paragraph}</p>)}
              {selected.attachment && <div className="ow-attachment"><Paperclip size={16} /><div><strong>{selected.attachment}</strong><span>Attachment · ready to open</span></div><ChevronRight size={14} style={{ marginLeft: "auto", color: "#9aa9a3" }} /></div>}
            </div>
            <div className="ow-inline-reply">
              <button type="button" onClick={() => setComposer("reply")}><Reply size={14} /> Reply to {selected.sender.split(" ")[0]}</button>
              <button type="button" onClick={() => markNeedsReply(selected.id)}><Clock3 size={14} /> {selected.needsReply ? "Clear follow-up" : "Add follow-up"}</button>
              <span>Press R to reply</span>
            </div>

            {contextOpen && (
              <aside className="ow-context">
                <div className="ow-eyebrow">Sender context</div>
                <h3 style={{ marginTop: 7 }}>{selected.sender}</h3>
                <p className="ow-context-intro">Useful details stay close to the message, not hidden in another screen.</p>
                <div className="ow-context-person">
                  <Avatar message={selected} size="large" />
                  <div><strong>{selected.address.split("@")[0]}</strong><span>{selected.address.split("@")[1]}</span></div>
                </div>
                <div className="ow-context-block">
                  <div className="ow-context-label"><Tag size={12} /> Current labels</div>
                  <p>{selected.labels.join(" · ")}</p>
                  <button type="button" className="ow-context-link" onClick={() => showToast("Label picker opened for this conversation")}>Manage labels <Plus size={12} /></button>
                </div>
                <div className="ow-context-block">
                  <div className="ow-context-label"><Users size={12} /> Customer history</div>
                  <p>{selected.threadCount ? `${selected.threadCount} messages in this thread.` : "First message from this sender in the workspace."}</p>
                  <button type="button" className="ow-context-link" onClick={() => showToast("Customer timeline is ready for the next pass")}>View timeline <ChevronRight size={12} /></button>
                </div>
                <div className="ow-context-actions">
                  <button type="button" onClick={() => showToast("Conversation marked as important")}><Zap size={13} /> Mark important</button>
                  <button type="button" onClick={() => showToast("Sender details copied")}><UserRound size={13} /> Copy sender details</button>
                  <button type="button" onClick={() => toggleArchive(selected.id)}>{selected.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />} {selected.archived ? "Restore from archive" : "Archive thread"}</button>
                  <button type="button" onClick={() => showToast("Trash action queued for review")}><Trash2 size={13} /> Move to trash</button>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>

      {composer && <Composer mode={composer} message={selected} mailboxes={mailboxes} onClose={() => setComposer(null)} onSend={sendMessage} />}
      {toast && <div className="ow-toast"><CheckCircle2 size={15} />{toast}</div>}
    </div>
  );
}
