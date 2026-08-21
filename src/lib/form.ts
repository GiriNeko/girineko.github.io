export const FORM_KEY = 'ineko-form';
export const FLASH_KEY = 'ineko-flash';
export const AUTO_KEY = 'ineko-auto';
export type FormState = 'sheathed' | 'unsheathed';
export type FlashState = 'on' | 'off';
export type AutoState = 'on' | 'off';

export function isFormState(value: string | null): value is FormState {
  return value === 'sheathed' || value === 'unsheathed';
}

export function systemForm(): FormState {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'unsheathed' : 'sheathed';
}

export function isAutoState(value: string | null): value is AutoState {
  return value === 'on' || value === 'off';
}

export function readAuto(): AutoState {
  try {
    const saved = localStorage.getItem(AUTO_KEY);
    if (isAutoState(saved)) return saved;
  } catch {
    /* private mode */
  }
  return 'on';
}

export function applyAuto(auto: AutoState) {
  document.documentElement.dataset.auto = auto;
}

export function writeAuto(auto: AutoState) {
  applyAuto(auto);
  try {
    localStorage.setItem(AUTO_KEY, auto);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent<AutoState>('autochange', { detail: auto }));
}

export function isAutoOn() {
  return (document.documentElement.dataset.auto || readAuto()) === 'on';
}

export function readForm(): FormState {
  if (readAuto() === 'on') return systemForm();
  try {
    const saved = localStorage.getItem(FORM_KEY);
    if (isFormState(saved)) return saved;
  } catch {
    /* private mode */
  }
  return systemForm();
}

export function applyForm(form: FormState) {
  const root = document.documentElement;
  root.dataset.form = form;
  root.style.colorScheme = form === 'unsheathed' ? 'dark' : 'light';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', form === 'unsheathed' ? '#070B0E' : '#F3E6D4');
}

export function writeForm(form: FormState) {
  writeAuto('off');
  applyForm(form);
  try {
    localStorage.setItem(FORM_KEY, form);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent<FormState>('formchange', { detail: form }));
}

export function isFlashState(value: string | null): value is FlashState {
  return value === 'on' || value === 'off';
}

export function readFlash(): FlashState {
  try {
    const saved = localStorage.getItem(FLASH_KEY);
    if (isFlashState(saved)) return saved;
  } catch {
    /* private mode */
  }
  return 'off';
}

export function applyFlash(flash: FlashState) {
  document.documentElement.dataset.flash = flash;
}

export function writeFlash(flash: FlashState) {
  applyFlash(flash);
  try {
    localStorage.setItem(FLASH_KEY, flash);
  } catch {
    /* private mode */
  }
}

export function isFlashOn() {
  return document.documentElement.dataset.flash === 'on';
}
