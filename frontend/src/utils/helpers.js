import { format, isAfter, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try { return format(parseISO(date.toString()), 'MMM d, yyyy'); }
  catch { return '—'; }
};

export const formatRelative = (date) => {
  if (!date) return '—';
  try { return formatDistanceToNow(parseISO(date.toString()), { addSuffix: true }); }
  catch { return '—'; }
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'DONE') return false;
  return isAfter(new Date(), parseISO(dueDate.toString()));
};

export const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const statusLabel = (s) => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s);
export const statusValue = (s) => ({ 'todo': 'TODO', 'in-progress': 'IN_PROGRESS', 'done': 'DONE' }[s] || s);
export const priorityLabel = (p) => p ? p.charAt(0) + p.slice(1).toLowerCase() : '—';

export const apiError = (err) =>
  err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Something went wrong.';

export const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
export const STATUS_ORDER = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
