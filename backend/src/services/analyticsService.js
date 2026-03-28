export const buildMonthlySeries = (records, dateField = 'createdAt') => {
  const series = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    series.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString('default', { month: 'short' }),
      total: 0,
    });
  }

  records.forEach((record) => {
    const date = new Date(record[dateField]);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = series.find((item) => item.key === key);
    if (bucket) {
      bucket.total += 1;
    }
  });

  return series.map(({ key, ...item }) => item);
};
