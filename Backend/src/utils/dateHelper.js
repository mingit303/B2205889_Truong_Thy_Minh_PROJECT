// Helper functions cho xử lý ngày tháng

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDaysDiff = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

module.exports = { addDays, getDaysDiff, isOverdue, formatDate };
