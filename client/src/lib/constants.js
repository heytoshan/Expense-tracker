export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: '🍕', color: '#f97316' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#3b82f6' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { value: 'bills', label: 'Bills & Utilities', icon: '💡', color: '#eab308' },
  { value: 'health', label: 'Health', icon: '🏥', color: '#10b981' },
  { value: 'education', label: 'Education', icon: '📚', color: '#06b6d4' },
  { value: 'transport', label: 'Transport', icon: '🚗', color: '#6366f1' },
  { value: 'groceries', label: 'Groceries', icon: '🛒', color: '#14b8a6' },
  { value: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#f43f5e' },
  { value: 'other', label: 'Other', icon: '📦', color: '#64748b' }
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c])
);

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
