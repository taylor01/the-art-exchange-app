import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeInput from './CodeInput';

function Harness({ onComplete }) {
  const [value, setValue] = useState('');
  return <CodeInput value={value} onChange={setValue} onComplete={onComplete} />;
}

describe('CodeInput', () => {
  it('renders eight labelled boxes', () => {
    render(<Harness />);
    expect(screen.getAllByRole('textbox')).toHaveLength(8);
    expect(screen.getByLabelText('Digit 1 of 8')).toBeInTheDocument();
  });

  it('fills every box from a pasted code and reports it complete', () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    fireEvent.paste(screen.getByLabelText('Digit 1 of 8'), { clipboardData: { getData: () => '4812 0736' } });
    expect(screen.getByLabelText('Digit 8 of 8')).toHaveValue('6');
    expect(onComplete).toHaveBeenCalledWith('48120736');
  });

  it('ignores letters', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Digit 1 of 8'), { target: { value: 'a' } });
    expect(screen.getByLabelText('Digit 1 of 8')).toHaveValue('');
  });
});
