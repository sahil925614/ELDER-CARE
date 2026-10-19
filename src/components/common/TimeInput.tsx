interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export function TimeInput({ label, value, onChange, required, disabled }: TimeInputProps) {
  const [rawHour, rawMinute] = value.split(':');
  const hour24 = Number(rawHour);
  const hour = value ? String(hour24 % 12 || 12).padStart(2, '0') : '';
  const minute = rawMinute || '00';
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const controlClass = 'h-11 w-full min-w-0 rounded-lg border border-brand-100 bg-white px-2 text-sm font-normal text-brand-900';

  function change(nextHour: string, nextMinute: string, nextPeriod: string) {
    if (!nextHour) return onChange('');
    const next = Number(nextHour) % 12 + (nextPeriod === 'PM' ? 12 : 0);
    onChange(String(next).padStart(2, '0') + ':' + nextMinute);
  }

  return <div role="group" aria-label={label} className="mt-2 grid min-w-0 grid-cols-3 gap-1.5">
    <select aria-label={label + ' hour'} required={required} disabled={disabled} value={hour} onChange={(event) => change(event.target.value, minute, period)} className={controlClass}>
      <option value="">HH</option>{Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
    <select aria-label={label + ' minute'} disabled={disabled || !value} value={minute} onChange={(event) => change(hour, event.target.value, period)} className={controlClass}>
      {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((item) => <option key={item} value={item}>{item}</option>)}
    </select>
    <select aria-label={label + ' AM/PM'} disabled={disabled || !value} value={period} onChange={(event) => change(hour, minute, event.target.value)} className={controlClass}><option>AM</option><option>PM</option></select>
  </div>;
}
