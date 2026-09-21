import { Cookie, ExternalLink, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router';
import { PageLayout } from '../components/PageLayout';
import { openCookieSettings } from '../../lib/cookieConsent';

const cookieRows = [
  {
    name: 'izy_cookie_consent',
    provider: 'Izy Technologies',
    purpose: 'Stores your cookie choices so we do not ask again on every page.',
    category: 'Necessary',
    duration: '12 months',
  },
  {
    name: 'sidebar_state',
    provider: 'Izy Technologies',
    purpose: 'Remembers whether a supported navigation sidebar is expanded or collapsed.',
    category: 'Functional preference',
    duration: '7 days',
  },
  {
    name: 'Smartsupp chat cookies',
    provider: 'Smartsupp',
    purpose: 'Supports the optional live-chat widget and remembers chat-related state.',
    category: 'Support chat',
    duration: 'Provider-managed',
  },
];

export function CookiePolicyPage() {
  return (
    <PageLayout>
      <header className="relative overflow-hidden bg-[#041627] pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_20%,rgba(240,162,14,0.12),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-6 bg-[#F0A20E]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F0A20E]">Privacy choices</span>
          </div>
          <h1 className="max-w-3xl text-white" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.3rem,5vw,4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Cookie Policy
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55">
            This page explains the cookies and similar browser storage used by Izy Technologies Global Services Limited, what each category does, and how to change your choices.
          </p>
        </div>
      </header>

      <main className="bg-white">
        <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Necessary', text: 'Always active because the site cannot remember essential settings without it.' },
              { icon: SlidersHorizontal, title: 'Optional choices', text: 'Analytics and support chat stay off until you allow them.' },
              { icon: Cookie, title: 'Change anytime', text: 'Use the settings button below to review or update your choice.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-gray-100 bg-[#f8fafc] p-6">
                <Icon size={20} className="mb-4 text-[#F0A20E]" />
                <h2 className="text-base font-bold text-[#041627]">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#041627]/55">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-6 bg-[#F0A20E]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#F0A20E]">What we use</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#041627]">Cookies and similar storage</h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#041627]/60">
              We keep the list below limited to storage and services used by this site. Some optional services are operated by third parties and may set additional provider-managed cookies when you enable them.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto border border-gray-100">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#041627] text-xs uppercase tracking-wide text-white/70">
                <tr>
                  <th className="px-5 py-4 font-semibold">Name / provider</th>
                  <th className="px-5 py-4 font-semibold">Purpose</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cookieRows.map(row => (
                  <tr key={row.name} className="align-top text-[#041627]/65">
                    <td className="px-5 py-5">
                      <code className="break-all text-xs text-[#041627]">{row.name}</code>
                      <span className="mt-1 block text-xs text-[#041627]/40">{row.provider}</span>
                    </td>
                    <td className="px-5 py-5 leading-relaxed">{row.purpose}</td>
                    <td className="px-5 py-5 whitespace-nowrap">{row.category}</td>
                    <td className="px-5 py-5 whitespace-nowrap">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mt-12 border-l-2 border-[#F0A20E] bg-[#fffaf0] p-5">
            <h2 className="text-base font-bold text-[#041627]">Analytics is not a tracking cookie</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#041627]/65">
              When you allow analytics, the site uses a first-party consent cookie plus session storage to remember your choice and group short-term repeat visits. The server receives only coarse visit details. We do not store raw IP addresses, raw user-agent strings, form contents, assessment access tokens, or a persistent visitor identifier.
            </p>
          </section>

          <section className="mt-12 flex flex-col items-start justify-between gap-5 border border-[#d9e8df] bg-[#f5fbf7] p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-[#123b23]">Review your choices</h2>
              <p className="mt-1 text-sm text-[#42624d]">You can allow or withdraw optional analytics and support chat consent at any time.</p>
            </div>
            <button
              type="button"
              onClick={openCookieSettings}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#16803c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#126b32]"
            >
              Manage cookies <SlidersHorizontal size={15} />
            </button>
          </section>

          <p className="mt-10 text-xs leading-relaxed text-[#041627]/40">
            Last updated: 21 September 2026. If a third-party provider changes its cookie names or retention period, its own documentation may contain the most current technical details.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C88700] hover:text-[#041627]">
            Return to the website <ExternalLink size={14} />
          </Link>
        </section>
      </main>
    </PageLayout>
  );
}