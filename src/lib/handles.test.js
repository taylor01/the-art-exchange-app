import { describe, it, expect } from 'vitest';
import { collectorPath, handleReasonMessage, isValidHandle, normalizeHandle } from './handles';

describe('handles', () => {
  it('normalizes what people type', () => {
    expect(normalizeHandle('  @Moth_Fan ')).toBe('moth_fan');
  });

  it('matches the API format rule', () => {
    expect(isValidHandle('moth_fan')).toBe(true);
    expect(isValidHandle('ab')).toBe(false);
    expect(isValidHandle('1moth')).toBe(false);
    expect(isValidHandle('moth-fan')).toBe(false);
    expect(isValidHandle('a'.repeat(31))).toBe(false);
  });

  it('explains each reason the API gives', () => {
    expect(handleReasonMessage('taken')).toMatch(/taken/);
    expect(handleReasonMessage('reserved')).toMatch(/reserved/);
    expect(handleReasonMessage('invalid')).toMatch(/3–30/);
    expect(handleReasonMessage(null)).toBeNull();
  });

  it('builds the public page path', () => {
    expect(collectorPath('@Moth_Fan')).toBe('/c/moth_fan');
  });
});
