import { useEffect, useState } from 'react';
import { authJson } from '../../lib/adminApi';

interface Props {
  pageId: string;
  title: string;
  url: string;
  children: React.ReactNode;
}

export function PreviewAccessGate({ pageId, title, url, children }: Props) {
  const [allowed, setAllowed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    authJson('/api/dev/previews/events?limit=1', {}, '/dev/login')
      .then(() => authJson('/api/dev/previews/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: pageId,
          page_title: title,
          page_url: url,
          event_type: 'preview_opened',
        }),
      }, '/dev/login'))
      .then(() => { if (active) setAllowed(true); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [pageId, title, url]);

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f3f8] p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#1a1a2e]">{failed ? 'Preview access denied' : 'Verifying developer access…'}</h1>
          <p className="mt-2 text-sm text-slate-500">{failed ? 'This preview is available only to the authorised developer account.' : 'Please wait while your access is checked.'}</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
