import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { applyForm, isFlashOn, readForm, writeForm, type FormState } from '../lib/form';

gsap.registerPlugin(useGSAP);

export default function FormToggle() {
  const root = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState<FormState>('sheathed');

  const { contextSafe } = useGSAP(
    () => {
      const current = readForm();
      applyForm(current);
      setForm(current);
    },
    { scope: root },
  );

  const onToggle = contextSafe(() => {
    if (document.documentElement.classList.contains('is-morphing')) return;
    const next: FormState = document.documentElement.dataset.form === 'unsheathed' ? 'sheathed' : 'unsheathed';
    play(next);
  });

  const play = contextSafe((next: FormState) => {
    const prev: FormState = next === 'unsheathed' ? 'sheathed' : 'unsheathed';
    const showCopy = document.querySelector<HTMLElement>(`[data-face="${next}"]`);
    const hideCopy = document.querySelector<HTMLElement>(`[data-face="${prev}"]`);
    const showWall = document.querySelector<HTMLElement>(`.wall-${next}`);
    const hideWall = document.querySelector<HTMLElement>(`.wall-${prev}`);
    const layers = [showCopy, hideCopy, showWall, hideWall];

    const finish = () => {
      for (const el of layers) {
        if (el) gsap.set(el, { clearProps: 'all' });
      }
      document.documentElement.classList.remove('is-morphing');
    };

    if (!showCopy || !hideCopy || !showWall || !hideWall) {
      writeForm(next);
      setForm(next);
      finish();
      return;
    }

    document.documentElement.classList.add('is-morphing');

    if (isFlashOn()) {
      gsap.set(hideWall, { autoAlpha: 1 });
      gsap.set(hideCopy, { autoAlpha: 1, visibility: 'visible' });
      gsap.set(showWall, { autoAlpha: 0 });
      gsap.set(showCopy, { autoAlpha: 0, visibility: 'hidden' });

      gsap
        .timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: finish,
        })
        .to([hideWall, hideCopy], { autoAlpha: 0, duration: 0.35 }, 0)
        .add(() => {
          writeForm(next);
          setForm(next);
          gsap.set(showCopy, { visibility: 'visible', autoAlpha: 0 });
        })
        .to([showWall, showCopy], { autoAlpha: 1, duration: 0.4 }, '+=0.08');
      return;
    }

    writeForm(next);
    setForm(next);
    gsap.set(showCopy, { autoAlpha: 0, visibility: 'visible' });
    gsap.set(hideCopy, { autoAlpha: 1, visibility: 'visible' });
    gsap.set(showWall, { autoAlpha: 0 });
    gsap.set(hideWall, { autoAlpha: 1 });

    gsap
      .timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: finish,
      })
      .to(hideWall, { autoAlpha: 0, duration: 0.55 }, 0)
      .to(showWall, { autoAlpha: 1, duration: 0.55 }, 0)
      .to(hideCopy, { autoAlpha: 0, duration: 0.4 }, 0)
      .to(showCopy, { autoAlpha: 1, duration: 0.4 }, 0.08);
  });

  return (
    <button
      ref={root}
      className="toggle form-toggle"
      type="button"
      aria-pressed={form === 'unsheathed'}
      aria-label={form === 'unsheathed' ? '合鞘' : '出鞘'}
      onClick={onToggle}
    >
      <span className="toggle-label">
        <span data-when="sheathed">出鞘</span>
        <span data-when="unsheathed">合鞘</span>
      </span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
