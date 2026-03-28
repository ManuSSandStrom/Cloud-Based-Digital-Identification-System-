export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Not available';

export const getDashboardRoute = (accountType) => {
  if (accountType === 'user') return '/dashboard/user';
  if (accountType === 'organization') return '/dashboard/org';
  return '/dashboard/admin';
};

export const extractUniqueId = (value) => {
  if (!value) return '';
  const segments = String(value).trim().split('/');
  return segments[segments.length - 1];
};
