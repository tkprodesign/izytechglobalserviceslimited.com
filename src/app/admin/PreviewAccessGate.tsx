import { useEffect } from 'react';
import { getToken } from '../../lib/auth';
import { authJson } from '../../lib/adminApi';

interface Props {
  pageId: string;
  title: string;
  url: string;
  children: React.ReactNode;
}

/**
 * Preview pages are intentionally public. When a developer is signed in,
 * keep recording preview opens through the protected, append-only event API.
 * Public visitors are never blocked by the developer-only logging service.
 */
export function PreviewAccessGate({ pageId, title, url, children }: Props) {
  useEffect(() => {
    if (!getToken()) return;

    void authJson('/api/dev/previews/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: pageId,
        page_title: title,
        page_url: url,
        event_type: 'preview_opened',
      }),
    }).catch(() => {
      // Preview rendering must remain independent of optional activity logging.
    });
  }, [pageId, title, url]);

  return <>{children}</>;
}
