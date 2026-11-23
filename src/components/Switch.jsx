// A square on/off switch for changes that apply right away.
export default function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      className="tax-switch"
      role="switch"
      aria-checked={checked ? 'true' : 'false'}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}
