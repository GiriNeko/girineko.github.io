import { useEffect, useState } from 'react';
import { applyFlash, readFlash, writeFlash, type FlashState } from '../lib/form';

export default function FlashToggle() {
  const [flash, setFlash] = useState<FlashState>('off');

  useEffect(() => {
    const current = readFlash();
    applyFlash(current);
    setFlash(current);
  }, []);

  const onToggle = () => {
    const next: FlashState = flash === 'on' ? 'off' : 'on';
    writeFlash(next);
    setFlash(next);
  };

  return (
    <button
      className="toggle flash-toggle"
      type="button"
      aria-pressed={flash === 'on'}
      aria-label={flash === 'on' ? '关闭飞光' : '开启飞光，切换时先灭后亮'}
      onClick={onToggle}
    >
      <span className="toggle-label">飞光</span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </button>
  );
}
