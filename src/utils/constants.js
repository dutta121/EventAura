// src/utils/constants.js
export const CATEGORIES = [
  {
    id: 'birthday',
    name: 'Birthday Planning',
    icon: '🎂',
    description: 'Themed packages & custom builder',
    color: '#f472b6',
    gradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
  },
  {
    id: 'wedding',
    name: 'Wedding Decoration',
    icon: '💍',
    description: 'Elegant galleries & tiering options',
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  },
  {
    id: 'dj',
    name: 'DJ Booking',
    icon: '🎧',
    description: 'Genre filters & mock portfolios',
    color: '#60a5fa',
    gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: '📷',
    description: 'Candid, traditional & cinematic',
    color: '#34d399',
    gradient: 'linear-gradient(135deg, #34d399, #10b981)',
  },
];

export const BOOKING_STATUSES = {
  pending: { label: 'Pending', color: '#fbbf24' },
  confirmed: { label: 'Confirmed', color: '#60a5fa' },
  completed: { label: 'Completed', color: '#34d399' },
  cancelled: { label: 'Cancelled', color: '#f87171' },
};
