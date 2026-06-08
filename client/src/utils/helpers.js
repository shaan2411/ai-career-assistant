// src/utils/helpers.js

/**
 * Format a date string to a human-readable format
 * @param {string|Date} date
 * @param {string} format - 'short' | 'long' | 'relative'
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  const d = new Date(date);

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Get score color class based on score value
 * @param {number} score - 0 to 100
 */
export const getScoreColor = (score) => {
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#F59E0B'; // yellow
  if (score >= 40) return '#F97316'; // orange
  return '#EF4444'; // red
};

/**
 * Get score label based on value
 */
export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
};

/**
 * Truncate a string to a max length
 */
export const truncate = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get initials from a name (e.g., "John Doe" → "JD")
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format salary range
 */
export const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
  const currency = salary.currency || 'USD';
  if (salary.currency && salary.currency.includes('/')) {
    return `$${salary.min} - $${salary.max} ${currency}`;
  }
  return `$${salary.min?.toLocaleString()} - $${salary.max?.toLocaleString()} ${currency}/year`;
};

/**
 * Job type badge color mapping
 */
export const getJobTypeBadge = (type) => {
  const map = {
    'full-time': 'success',
    'part-time': 'info',
    'internship': 'warning',
    'remote': 'primary',
    'contract': 'secondary',
  };
  return map[type] || 'secondary';
};

/**
 * Calculate profile completion percentage from profile data
 */
export const calculateCompletion = (profile) => {
  if (!profile) return 0;
  const fields = [
    profile.bio,
    profile.phone,
    profile.location,
    profile.github,
    profile.linkedin,
    profile.skills?.length > 0,
    profile.education?.length > 0,
    profile.experience?.length > 0,
    profile.careerGoal,
    profile.interests?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

/**
 * Export data as CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse API error message from axios error
 */
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Random career tip of the day
 */
const careerTips = [
  'Tailor your resume for each job application — generic resumes get ignored.',
  'Follow up after an interview within 24 hours with a thank-you email.',
  'Keep your LinkedIn profile updated with your latest projects and skills.',
  'Build a portfolio of real projects to showcase your practical skills.',
  'Network actively — 70% of jobs are filled through referrals.',
  'Practice coding problems daily to stay sharp for technical interviews.',
  'Quantify your achievements: "Improved performance by 40%" is better than "Improved performance".',
  'Learn one new technology per month to stay relevant in the industry.',
  'Contribute to open source projects to demonstrate your skills.',
  'Soft skills matter as much as technical skills — practice communication.',
  'Set up Google Alerts for companies you want to work for.',
  'Research the company deeply before every interview.',
];

export const getDailyTip = () => {
  const dayIndex = new Date().getDate() % careerTips.length;
  return careerTips[dayIndex];
};
