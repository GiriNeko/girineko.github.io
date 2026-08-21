import { useEffect, useState } from 'react';
import {
  applyAuto,
  applyForm,
  readAuto,
  systemForm,
  writeAuto,
  type AutoState,
  type FormState,
} from '../lib/form';

export default function AutoToggle() {
  const [auto, setAuto] = useState<AutoState>('on');

  useEffect(() => {
    const current = readAuto();
    applyAuto(current);
    setAuto(current);
    if (current === 'on') {
      const form = systemForm();
      applyForm(form);
      window.dispatchEvent(new CustomEvent<FormState>('formchange', { detail: form }));
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => {
      if ((document.documentElement.dataset.auto || readAuto()) !== 'on') return;
      const form = systemForm();
      applyForm(form);
      window.dispatchEvent(new CustomEvent<FormState>('formchange', { detail: form }));
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
    if (next === 'on') {
      const form = systemForm();
      applyForm(form);
      window.dispatchEvent(new CustomEvent<FormState>('formchange', { detail: form }));
    }
  };

  return (
    <button
      className="toggle auto-toggle"
      type="button"
      aria-pressed={auto === 'on'}
      aria-label={auto === 'on' ? '关闭听凭剑引' : '开启听凭剑引，跟随系统明暗'}
      onClick={onToggle}
    >
      <span className="toggle-label">听凭剑引</span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
