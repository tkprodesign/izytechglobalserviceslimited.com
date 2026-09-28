import { useNavigate } from 'react-router';

interface VersionSwitcherProps {
  current: 'original' | 'v2';
  originalPath: string;
  v2Path: string;
  /** 'admin' uses blue accent, 'dev' uses orange accent */
  variant?: 'admin' | 'dev';
}

/**
 * Small, polished panel control for switching between Original and V2 dashboards.
 * Deliberately looks like a standard segmented control, not a debug toggle.
 * Displays "Original | Try V2" on Original dashboard, and "Original | V2" on V2 dashboard.
 */
export function VersionSwitcher({ current, originalPath, v2Path, variant = 'admin' }: VersionSwitcherProps) {
  const navigate = useNavigate();
  const accent = variant === 'admin' ? 'var(--izy-blue)' : '#f26522';
  const accentBg = variant === 'admin' ? 'rgba(29,112,201,0.12)' : 'rgba(242,101,34,0.12)';

  return (
    <div
      role="group"
      aria-label="Dashboard version"
      className="inline-flex items-center rounded-lg border bg-white p-0.5 text-xs font-medium shadow-sm"
      style={{ borderColor: '#d8e0e7' }}
    >
      <button
        type="button"
        aria-pressed={current === 'original'}
        onClick={() => current !== 'original' && navigate(originalPath)}
        className="rounded-md px-3 py-1.5 transition-all focus:outline-none focus-visible:ring-2"
        style={{
          background: current === 'original' ? accentBg : 'transparent',
          color: current === 'original' ? accent : '#5a6a82',
          fontWeight: current === 'original' ? 600 : 400,
        }}
      >
        Original
      </button>
      <button
        type="button"
        aria-pressed={current === 'v2'}
        onClick={() => current !== 'v2' && navigate(v2Path)}
        className="rounded-md px-3 py-1.5 transition-all focus:outline-none focus-visible:ring-2"
        style={{
          background: current === 'v2' ? accentBg : 'transparent',
          color: current === 'v2' ? accent : '#5a6a82',
          fontWeight: current === 'v2' ? 600 : 400,
        }}
      >
        {current === 'original' ? 'Try V2' : 'V2'}
      </button>
    </div>
  );
}
