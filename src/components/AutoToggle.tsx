import { useEffect, useState } from 'react';
import { defaults, labels } from '../config';
import {
  applyAuto,
  applyForm,
  readAuto,
  systemForm,
  writeAuto,
  type AutoState,
  type FormState,
} from '../lib/form';
import { morphTo } from '../lib/morph';

function followSystem(animate: boolean) {
  const form = systemForm();
  if (!animate || document.documentElement.dataset.form === form) {
    applyForm(form);
    window.dispatchEvent(new CustomEvent<FormState>('formchange', { detail: form }));
    return;
  }
  morphTo(form, { persist: false });
  window.dispatchEvent(new CustomEvent<FormState>('formchange', { detail: form }));
}

export default function AutoToggle() {
  const [auto, setAuto] = useState<AutoState>(defaults.auto);

  useEffect(() => {
    const current = readAuto();
    applyAuto(current);
    setAuto(current);
    if (current === 'on') followSystem(false);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => {
      if ((document.documentElement.dataset.auto || readAuto()) !== 'on') return;
      followSystem(true);
    };
    media.addEventListener('change', onScheme);

    const onAuto = (event: Event) => {
      const next = (event as CustomEvent<AutoState>).detail;
      setAuto(next);
    };
    window.addEventListener('autochange', onAuto);

    return () => {
      media.removeEventListener('change', onScheme);
      window.removeEventListener('autochange', onAuto);
    };
  }, []);

  const onToggle = () => {
    const next: AutoState = auto === 'on' ? 'off' : 'on';
    writeAuto(next);
    setAuto(next);
    if (next === 'on') followSystem(true);
  };

  return (
    <button
      className="toggle auto-toggle"
      type="button"
      aria-pressed={auto === 'on'}
      aria-label={auto === 'on' ? `关闭${labels.auto}` : `开启${labels.auto}，跟随系统明暗`}
      onClick={onToggle}
    >
      <span className="toggle-label">{labels.auto}</span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
