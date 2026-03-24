import dayjs from 'dayjs';

export function formatDate(value: string, format = 'DD.MM.YYYY'): string {
  return dayjs(value).format(format);
}

export function formatDateTime(value: string): string {
  return dayjs(value).format('DD.MM.YYYY HH:mm:ss');
}
