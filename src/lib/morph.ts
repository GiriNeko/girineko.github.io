import gsap from 'gsap';
import { applyForm, isFlashOn, writeForm, type FormState } from './form';

export type MorphOptions = {
  persist?: boolean;
};

function layers(next: FormState) {
  const prev: FormState = next === 'unsheathed' ? 'sheathed' : 'unsheathed';
  return {
    prev,
    showCopy: document.querySelector<HTMLElement>(`[data-face="${next}"]`),
    hideCopy: document.querySelector<HTMLElement>(`[data-face="${prev}"]`),
    showWall: document.querySelector<HTMLElement>(`.wall-${next}`),
    hideWall: document.querySelector<HTMLElement>(`.wall-${prev}`),
  };
}

function commit(next: FormState, persist: boolean) {
  if (persist) writeForm(next);
  else applyForm(next);
}

export function morphTo(next: FormState, options: MorphOptions = {}) {
  const persist = options.persist ?? true;
  const current = document.documentElement.dataset.form;
  if (current === next) {
    commit(next, persist);
    return;
  }
  if (document.documentElement.classList.contains('is-morphing')) return;

  const { showCopy, hideCopy, showWall, hideWall } = layers(next);
  const parts = [showCopy, hideCopy, showWall, hideWall];

  const finish = () => {
    for (const el of parts) {
      if (el) gsap.set(el, { clearProps: 'all' });
    }
    document.documentElement.classList.remove('is-morphing');
  };

  if (!showCopy || !hideCopy || !showWall || !hideWall) {
    commit(next, persist);
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
        commit(next, persist);
        gsap.set(showCopy, { visibility: 'visible', autoAlpha: 0 });
      })
      .to([showWall, showCopy], { autoAlpha: 1, duration: 0.4 }, '+=0.08');
    return;
  }

  commit(next, persist);
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
}
