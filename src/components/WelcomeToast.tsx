import { useEffect, useState } from 'react';
import { toast, toastIcons, toastPeriodAt, type ToastIconId } from '../config';

function ToastIcon({ id }: { id: ToastIconId }) {
  const icon = toastIcons[id];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {'circle' in icon && icon.circle ? (
        <circle cx={icon.circle.cx} cy={icon.circle.cy} r={icon.circle.r} fill="currentColor" />
      ) : null}
      {'rays' in icon && icon.rays ? (
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" d={icon.rays} />
      ) : null}
      {'path' in icon && icon.path ? <path fill="currentColor" d={icon.path} /> : null}
    </svg>
  );
}

function whenPageReady(onReady: () => void) {
  if (document.readyState === 'complete') {
    onReady();
    return () => {};
  }
  window.addEventListener('load', onReady, { once: true });
  return () => window.removeEventListener('load', onReady);
}

export default function WelcomeToast() {
  const [phase, setPhase] = useState<'hidden' | 'in' | 'out'>('hidden');
  const [period] = useState(() => toastPeriodAt(new Date().getHours()));

  useEffect(() => {
    let hideTimer = 0;
    let outTimer = 0;
    const release = whenPageReady(() => {
      setPhase('in');
      hideTimer = window.setTimeout(() => setPhase('out'), toast.holdMs);
      outTimer = window.setTimeout(() => setPhase('hidden'), toast.holdMs + 420);
    });
    return () => {
      release();
      window.clearTimeout(hideTimer);
      window.clearTimeout(outTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`welcome-toast is-${phase}`} role="status" aria-live="polite">
      <div className="welcome-toast-copy">
        <div className="welcome-toast-face" data-toast-face="sheathed">
          <span className="welcome-toast-icon">
            <ToastIcon id={period.icon} />
          </span>
          <p>
            <strong>{period.sheathed.hello}</strong>
            {`，${period.sheathed.welcome}`}
          </p>
        </div>
        <div className="welcome-toast-face" data-toast-face="unsheathed">
          <span className="welcome-toast-icon">
            <ToastIcon id={period.icon} />
          </span>
          <p>
            <strong>{period.unsheathed.hello}</strong>
            {`，${period.unsheathed.welcome}`}
          </p>
        </div>
      </div>
    </div>
  );
}
