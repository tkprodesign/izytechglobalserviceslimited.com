import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PenSquare,
  Receipt,
  RefreshCw,
  Reply,
  Search,
  Send,
  ShoppingBag,
  Star,
  Trash2,
  X,
} from "lucide-react";
import "./_group.css";

type Account = { id: string; label: string; email: string; color: string; sendOnly?: boolean; virtual?: boolean };
type Message = {
  id: string;
  from: string;
  address: string;
  subject: string;
  preview: string;
  date: string;
  seen: boolean;
  sent?: boolean;
  archived?: boolean;
};

const allMail: Account = { id: "all", label: "All Mail", email: "All configured mailboxes", color: "#6366f1", virtual: true };
const accounts: Account[] = [
  { id: "info", label: "Info", email: "info@izyane.com", color: "#2563eb" },
  { id: "projects", label: "Projects", email: "projects@izyane.com", color: "#0f766e" },
  { id: "noreply", label: "No Reply", email: "noreply@izyane.com", color: "#f26522", sendOnly: true },
];
const messages: Message[] = [
  { id: "1", from: "Amina Yusuf", address: "amina.yusuf@greenfield.ng", subject: "Website assessment request", preview: "Hello, we would like to schedule a site assessment for our new office project.", date: "10:42", seen: false },
  { id: "2", from: "Chinedu Okafor", address: "chinedu@oakandstone.com", subject: "Re: Quote for retail fit-out", preview: "Thanks for sending this through. Could we revise the timeline to begin in June?", date: "Yesterday", seen: true },
  { id: "3", from: "IZY Projects", address: "projects@izyane.com", subject: "Project handover checklist", preview: "The final checklist and completion photos are attached for your review.", date: "Mon", seen: true, sent: true },
  { id: "4", from: "Bello & Partners", address: "hello@bellopartners.com", subject: "Office interiors consultation", preview: "We are exploring a warm, modern interior for our Lagos headquarters.", date: "14 May", seen: false },
  { id: "5", from: "Adaeze Nwosu", address: "adaeze@northstar.ng", subject: "Thank you for your proposal", preview: "The proposal looks excellent. We will come back to you with feedback shortly.", date: "12 May", seen: true },
  { id: "6", from: "IZY Studio", address: "info@izyane.com", subject: "Your enquiry has been received", preview: "Thank you for contacting IZY. A member of our team will be in touch soon.", date: "10 May", seen: true, sent: true },
];

const navItems = [
  [LayoutDashboard, "Dashboard"],
  [Inbox, "Email Manager"],
  [Mail, "Contacts"],
  [FileText, "Quote Requests"],
  [ClipboardCheck, "Site Assessments"],
  [ShoppingBag, "Store Products"],
  [FolderOpen, "Projects"],
  [MessageSquare, "Testimonials"],
  [Receipt, "Invoices"],
] as const;

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`hidden md:flex shrink-0 flex-col ${collapsed ? "w-[72px]" : "w-64"}`} style={{ background: "#0d1b2e", minHeight: "100vh" }}>
      <div className="flex items-center justify-between border-b px-4 py-5" style={{ borderColor: "rgba(255,255,255,.08)" }}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#1a5fab,#2d7dd2)" }}>IZY</div>
          {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold leading-none text-white">Admin Panel</p><p className="mt-1 truncate text-xs" style={{ color: "#8fadc8" }}>CEO Access</p></div>}
        </div>
        <button className="rounded-lg p-2 text-[#8fadc8] hover:bg-white/10" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><PanelLeftClose size={17} /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4a6a85" }}>Business</p>}
        {navItems.map(([Icon, label]) => (
          <button key={label} className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all ${label === "Email Manager" ? "text-white" : "text-[#8fadc8] hover:bg-white/5 hover:text-white"}`} style={label === "Email Manager" ? { background: "var(--izy-blue)" } : undefined}>
            <Icon size={17} className="shrink-0" /> {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>
      <div className="border-t px-3 py-4" style={{ borderColor: "rgba(255,255,255,.08)" }}>
        <div className="mb-1 flex items-center gap-3 px-4 py-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#1a5fab" }}>A</div>{!collapsed && <div className="min-w-0"><p className="truncate text-xs font-medium text-white">admin@izyane.com</p><p className="text-xs" style={{ color: "#8fadc8" }}>admin</p></div>}</div>
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[#8fadc8] hover:bg-white/5 hover:text-white"><Send size={17} />{!collapsed && "Sign out"}</button>
      </div>
    </aside>
  );
}

function Compose({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,22,39,.5)", backdropFilter: "blur(4px)" }}>
    <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "92vh" }}>
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "#eef1f6" }}><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "#eff6ff" }}><PenSquare size={14} color="#2563eb" /></div><span className="text-sm font-semibold" style={{ color: "#0f172a" }}>New Message</span></div><button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-100"><X size={15} color="#94a3b8" /></button></div>
      <div className="space-y-3 overflow-y-auto px-5 py-4">
        {["From", "To", "Subject"].map((label, i) => <label key={label} className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{label}</span>{i === 0 ? <select className="w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}><option>Info — info@izyane.com</option></select> : <input className="w-full rounded-lg border px-3 py-2 text-sm outline-none" placeholder={i === 1 ? "recipient@example.com" : "What is this about?"} style={{ borderColor: "#e2e8f0", background: "#f8fafc" }} />}</label>)}
        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Message</span><textarea rows={7} className="w-full resize-none rounded-lg border px-3 py-2 text-sm" placeholder="Write your message…" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }} /></label>
      </div>
      <div className="flex items-center justify-between border-t px-5 py-3" style={{ borderColor: "#eef1f6" }}><p className="text-[11px]" style={{ color: "#94a3b8" }}>Composing new message</p><div className="flex gap-2"><button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium" style={{ color: "#64748b" }}>Discard</button><button onClick={onClose} className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white" style={{ background: "#2563eb" }}><Send size={14} />Send</button></div></div>
    </div>
  </div>;
}

export function Current() {
  const [account, setAccount] = useState<Account>(allMail);
  const [folder, setFolder] = useState("All Mail");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Message>(messages[0]);
  const [compose, setCompose] = useState(false);
  const [archived, setArchived] = useState(false);
  const filtered = useMemo(() => messages.filter(m => !query || `${m.from} ${m.subject} ${m.address}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="email-workspace min-h-screen flex" style={{ background: "#f0f3f8" }}>
    <AdminSidebar />
    <main className="min-w-0 flex-1 overflow-hidden">
      <header className="flex h-14 items-center gap-3 border-b bg-white px-4 md:hidden" style={{ borderColor: "#eef1f6" }}><Menu size={21} /><div><p className="text-sm font-semibold" style={{ color: "var(--izy-navy)" }}>Admin Panel</p><p className="text-[11px]" style={{ color: "#8fadc8" }}>CEO Access</p></div></header>
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden md:h-screen" style={{ background: "#f8fafc" }}>
        <div className="hidden w-56 shrink-0 flex-col border-r bg-white md:flex" style={{ borderColor: "#f1f5f9" }}>
          <div className="px-3 pb-3 pt-4"><button onClick={() => setCompose(true)} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}><PenSquare size={15} />Compose</button></div>
          <div className="px-3"><p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Mailboxes</p>{[allMail, ...accounts].map(a => <button key={a.id} onClick={() => setAccount(a)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left" style={{ background: account.id === a.id ? `${a.color}10` : "transparent" }}><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ background: a.color }}>{a.virtual ? <Mail size={13} /> : a.label[0]}</div><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium" style={{ color: account.id === a.id ? a.color : "#334155" }}>{a.label}</p><p className="truncate text-[11px]" style={{ color: "#94a3b8" }}>{a.virtual ? "All mail" : a.sendOnly ? "Send only" : a.email}</p></div>{account.id === a.id && <div className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />}</button>)}</div>
          <div className="mt-auto border-t px-3 pb-4 pt-3" style={{ borderColor: "#f1f5f9" }}><p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Folders</p>{["All Mail", "Inbox", "Sent", "Archived"].map((f, i) => <button key={f} onClick={() => setFolder(f)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left" style={{ background: folder === f ? "#f1f5f9" : "transparent" }}><span style={{ color: folder === f ? "#2563eb" : "#94a3b8" }}>{i === 0 ? <Mail size={16} /> : i === 1 ? <Inbox size={16} /> : i === 2 ? <Send size={16} /> : <Archive size={16} />}</span><span className="flex-1 text-[13px]" style={{ color: folder === f ? "#0f172a" : "#64748b", fontWeight: folder === f ? 600 : 400 }}>{f}</span>{f === "Inbox" && <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: "#2563eb" }}>2</span>}</button>)}</div>
        </div>
        <div className="flex min-h-0 w-full flex-1 flex-col border-r bg-white md:max-w-sm" style={{ borderColor: "#f1f5f9" }}>
          <div className="border-b px-4 pb-3 pt-4" style={{ borderColor: "#f1f5f9" }}><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-bold" style={{ color: "#0f172a" }}>{account.label}</h2><p className="text-[11px]" style={{ color: "#94a3b8" }}>{folder} · 6 messages</p></div><div className="flex gap-1"><button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"><RefreshCw size={14} color="#64748b" /></button><button onClick={() => setCompose(true)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-blue-50 md:hidden"><PenSquare size={14} color="#2563eb" /></button></div></div><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#94a3b8" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search messages…" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none" style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0f172a" }} /></div></div>
          <div className="flex-1 overflow-y-auto">{filtered.map(m => <button key={m.id} onClick={() => setSelected(m)} className="w-full border-b px-4 py-3 text-left transition-colors hover:bg-gray-50" style={{ borderColor: "#f1f5f9", background: selected.id === m.id ? "#eff6ff" : undefined, borderLeft: selected.id === m.id ? "3px solid #2563eb" : "3px solid transparent" }}><div className="flex items-start gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ background: m.sent ? "#6366f1" : "#2563eb" }}>{m.sent ? <Send size={13} /> : m.from[0]}</div><div className="min-w-0 flex-1"><div className="mb-0.5 flex items-center justify-between gap-2"><span className="truncate text-[13px]" style={{ color: "#0f172a", fontWeight: m.seen ? 400 : 600 }}>{m.sent ? `To ${m.from}` : m.from}</span><span className="shrink-0 text-[11px]" style={{ color: "#94a3b8" }}>{m.date}</span></div><p className="truncate text-[12px] font-medium" style={{ color: "#334155" }}>{m.subject}</p><p className="mt-0.5 truncate text-[11px]" style={{ color: "#94a3b8" }}>{m.preview}</p></div></div></button>)}</div>
        </div>
        <div className="hidden min-w-0 flex-1 flex-col md:flex">
          <div className="border-b bg-white px-6 py-4" style={{ borderColor: "#f1f5f9" }}><div className="flex items-start justify-between"><div className="min-w-0"><div className="mb-1 flex items-center gap-2"><span className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: selected.sent ? "#eef2ff" : "#eff6ff", color: selected.sent ? "#6366f1" : "#2563eb" }}>{selected.sent ? "Sent" : "Received"}</span><span className="text-[11px]" style={{ color: "#94a3b8" }}>Today, 10:42 WAT</span></div><h1 className="truncate text-lg font-semibold" style={{ color: "#0f172a" }}>{selected.subject}</h1><p className="mt-1 text-xs" style={{ color: "#64748b" }}>From <strong>{selected.from}</strong> &lt;{selected.address}&gt;</p></div><button className="rounded-lg p-2 hover:bg-gray-100"><MoreHorizontal size={18} color="#64748b" /></button></div><div className="mt-4 flex items-center gap-1"><button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50" style={{ color: "#2563eb" }}><Reply size={14} />Reply</button><button onClick={() => setArchived(!archived)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-amber-50" style={{ color: "#d97706" }}>{archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}{archived ? "Unarchive" : "Archive"}</button><button className="rounded-lg p-2 hover:bg-gray-100"><Star size={15} color="#94a3b8" /></button><button className="rounded-lg p-2 hover:bg-gray-100"><Trash2 size={15} color="#94a3b8" /></button></div></div>
          <div className="flex-1 overflow-y-auto p-6"><div className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "#f1f5f9" }}><div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "#f1f5f9" }}><span className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>Content</span><div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: "#f1f5f9" }}><button className="rounded-md bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm" style={{ color: "#2563eb" }}>HTML</button><button className="rounded-md px-2.5 py-1 text-[11px] font-medium" style={{ color: "#94a3b8" }}>Plain text</button></div></div><div className="space-y-4 p-6 text-sm leading-relaxed" style={{ color: "#334155" }}><p>Hello IZY team,</p><p>{selected.preview}</p><p>We would appreciate your guidance on the next steps and availability. Please let us know if you need any additional information from our side.</p><p>Kind regards,<br /><strong>{selected.from}</strong></p></div></div></div>
        </div>
      </div>
    </main>
    {compose && <Compose onClose={() => setCompose(false)} />}
  </div>;
}