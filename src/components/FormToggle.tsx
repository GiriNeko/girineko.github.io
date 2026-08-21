import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { labels } from '../config';
import { applyForm, readForm, type FormState } from '../lib/form';
import { morphTo } from '../lib/morph';

gsap.registerPlugin(useGSAP);

export default function FormToggle() {
  const root = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState<FormState>('sheathed');

  const { contextSafe } = useGSAP(
    () => {
      const current = readForm();
      applyForm(current);
      setForm(current);
      const onForm = (event: Event) => {
        const next = (event as CustomEvent<FormState>).detail;
        if (next === 'sheathed' || next === 'unsheathed') setForm(next);
      };
      window.addEventListener('formchange', onForm);
      return () => window.removeEventListener('formchange', onForm);
    },
    { scope: root },
  );

  const onToggle = contextSafe(() => {
    const next: FormState = document.documentElement.dataset.form === 'unsheathed' ? 'sheathed' : 'unsheathed';
    morphTo(next, { persist: true });
    setForm(next);
  });

  return (
    <button
      ref={root}
      className="toggle form-toggle"
      type="button"
      aria-pressed={form === 'unsheathed'}
      aria-label={form === 'unsheathed' ? labels.sheath : labels.unsheath}
      onClick={onToggle}
    >
      <span className="toggle-label">
        <span data-when="sheathed">{labels.unsheath}</span>
        <span data-when="unsheathed">{labels.sheath}</span>
      </span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
