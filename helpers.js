exports.formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

exports.calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

exports.calculateTotalPrice = (pricePerNight, startDate, endDate) => {
  const nights = this.calculateNights(startDate, endDate);
  return nights * pricePerNight;
};