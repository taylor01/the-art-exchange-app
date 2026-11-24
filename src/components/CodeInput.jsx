import { useRef } from 'react';
import { CODE_LENGTH as LENGTH } from '../config/auth';

// One box per digit of the emailed code, in two groups of four like the email. Typing moves forward, Backspace moves back,
// and pasting the whole code fills every box.
export default function CodeInput({ value, onChange, onComplete, disabled, label = 'Code' }) {
  const refs = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

  const setAt = (index, digit) => {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join('');
    onChange(joined);
    if (joined.length === LENGTH && !next.includes('')) onComplete?.(joined);
  };

  const handleChange = (index, event) => {
    const typed = event.target.value.replace(/\D/g, '');
    if (!typed) {
      setAt(index, '');
      return;
    }
    if (typed.length > 1) {
      fill(typed, index);
      return;
    }
    setAt(index, typed);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const fill = (text, start = 0) => {
    const clean = text.replace(/\D/g, '').slice(0, LENGTH - start);
    const next = digits.slice();
    for (let i = 0; i < clean.length; i += 1) next[start + i] = clean[i];
    const joined = next.join('');
    onChange(joined);
    const focusAt = Math.min(start + clean.length, LENGTH - 1);
    refs.current[focusAt]?.focus();
    if (joined.length === LENGTH && !next.includes('')) onComplete?.(joined);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      setAt(index - 1, '');
      event.preventDefault();
    }
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (index, event) => {
    const text = event.clipboardData.getData('text');
    if (/\d/.test(text)) {
      event.preventDefault();
      fill(text, index);
    }
  };

  return (
    <fieldset className="tax-field" style={{ border: 'none', margin: 0, padding: 0 }}>
      <legend className="tax-label" style={{ marginBottom: 'var(--space-2)' }}>{label}</legend>
      <div className="tax-code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { refs.current[index] = el; }}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={index === 0 ? LENGTH : 1}
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            disabled={disabled}
            autoFocus={index === 0}
          />
        ))}
      </div>
    </fieldset>
  );
}
