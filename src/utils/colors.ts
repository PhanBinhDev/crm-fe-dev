export function getContrastTextColor(bgColor: string) {
  const color = bgColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180 ? '#222' : '#fff';
}

export const getProgressColor = (percent: number) => {
  if (percent >= 80) return '#4caf50';
  if (percent >= 50) return '#ffc107';
  if (percent > 0) return '#ff9800';
  return '#f44336';
};

export const getProgressText = (percent: number) => {
  if (percent === 100) return 'Tuyệt vời! Bạn đã hoàn thành tất cả các nhiệm vụ 🎉';
  if (percent >= 80) return 'Sắp xong rồi! Chỉ còn một chút nữa thôi!';
  if (percent >= 50) return 'Bạn đã hoàn thành hơn một nửa công việc, cố lên!';
  if (percent > 0) return 'Bạn đã bắt đầu, hãy tiếp tục hoàn thành các nhiệm vụ!';
  return 'Hãy bắt đầu hoàn thành các nhiệm vụ để đạt tiến độ!';
};
