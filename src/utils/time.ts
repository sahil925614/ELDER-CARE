const clock = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });

export function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return value;
  return clock.format(new Date(Date.UTC(2000, 0, 1, hour, minute)));
}

export function formatTimeRange(value: string): string {
  return value.split(' - ').map(formatTime).join(' - ');
}
