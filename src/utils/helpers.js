// Format date to YYYY-MM-DD
exports.formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get date range for current month
exports.getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

// Get date range for current week
exports.getCurrentWeekRange = () => {
  const now = new Date();
  const firstDay = now.getDate() - now.getDay();
  const lastDay = firstDay + 6;

  const start = new Date(now.setDate(firstDay));
  start.setHours(0, 0, 0, 0);

  const end = new Date(now.setDate(lastDay));
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Check if date is today
exports.isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};
