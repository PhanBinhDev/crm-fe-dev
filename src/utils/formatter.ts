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

export  function hexToRgba(hex: any, alpha: any) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
