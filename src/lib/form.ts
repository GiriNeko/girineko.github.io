import { defaults, storageKeys, theme, type FormState, type ToggleState } from '../config';

export const FORM_KEY = storageKeys.form;
export const FLASH_KEY = storageKeys.flash;
export const AUTO_KEY = storageKeys.auto;

export type { FormState, ToggleState };
export type FlashState = ToggleState;
export type AutoState = ToggleState;

export function isFormState(value: string | null): value is FormState {
  return value === 'sheathed' || value === 'unsheathed';
}

export function systemForm(): FormState {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'unsheathed' : 'sheathed';
}

export function isToggleState(value: string | null): value is ToggleState {
  return value === 'on' || value === 'off';
}

export function readAuto(): AutoState {
  try {
    const saved = localStorage.getItem(AUTO_KEY);
    if (isToggleState(saved)) return saved;
  } catch {
    /* private mode */
  }
  return defaults.auto;
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
  const next = theme[form];
  root.dataset.form = form;
  root.style.colorScheme = next.scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next.color);
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

export function readFlash(): FlashState {
  try {
    const saved = localStorage.getItem(FLASH_KEY);
    if (isToggleState(saved)) return saved;
  } catch {
    /* private mode */
  }
  return defaults.flash;
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
