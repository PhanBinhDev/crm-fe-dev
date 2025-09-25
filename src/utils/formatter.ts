export const getUsername = (name: string): string => {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  const first = words[0][0].toUpperCase();
  const last = words[words.length - 1][0].toUpperCase();

  return first + last;
};

export function hexToRgba(hex: any, alpha: any) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const formatMinutesToText = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  } else if (minutes < 60 * 24) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} tiếng`;
    }
    return `${hours} tiếng ${remainingMinutes} phút`;
  } else if (minutes < 60 * 24 * 7) {
    const days = Math.floor(minutes / (60 * 8));
    return `${days} ngày`;
  } else if (minutes < 60 * 24 * 30) {
    const weeks = Math.floor(minutes / (60 * 8 * 5));
    return `${weeks} tuần`;
  } else {
    const months = Math.floor(minutes / (60 * 8 * 5 * 4));
    return `${months} tháng`;
  }
};
