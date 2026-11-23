import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeInput from './CodeInput';

function Harness({ onComplete }) {
  const [value, setValue] = useState('');
  return <CodeInput value={value} onChange={setValue} onComplete={onComplete} />;
}

describe('CodeInput', () => {
  it('renders six labelled boxes', () => {
    render(<Harness />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument();
  });

  it('fills every box from a pasted code and reports it complete', () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    fireEvent.paste(screen.getByLabelText('Digit 1 of 6'), { clipboardData: { getData: () => '481-207' } });
    expect(screen.getByLabelText('Digit 6 of 6')).toHaveValue('7');
    expect(onComplete).toHaveBeenCalledWith('481207');
  });

  it('ignores letters', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Digit 1 of 6'), { target: { value: 'a' } });
    expect(screen.getByLabelText('Digit 1 of 6')).toHaveValue('');
  });
});
