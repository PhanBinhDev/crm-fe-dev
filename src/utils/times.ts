export interface ParsedTime {
  minutes: number;
  displayText: string;
}

export const TIME_PATTERNS = [
  // Complex patterns FIRST (hours + minutes)
  { regex: /(\d+)\s*(?:tiếng|gio|h)\s*(\d+)\s*(?:phút|phut|p|m)$/i, isComplex: true },
  { regex: /(\d+)h\s*(\d+)(?:m|p)?$/i, isComplex: true },

  // Decimal hours
  { regex: /(\d+(?:[.,]\d+)?)\s*(?:tiếng|gio|h|hour)$/i, multiplier: 60, isDecimal: true },

  // Hours
  { regex: /(\d+)\s*(tiếng|tiengs|giờ|gio|h|hr|hour)$/i, multiplier: 60 },
  { regex: /(\d+)\s*h$/i, multiplier: 60 },
  { regex: /(\d+)\s*(tieng|gio)$/i, multiplier: 60 },

  // Minutes
  { regex: /(\d+)\s*(phút|phut|p|min|m)$/i, multiplier: 1 },
  { regex: /(\d+)\s*p$/i, multiplier: 1 },

  // Days (8 working hours)
  { regex: /(\d+)\s*(ngày|ngay|day|d)$/i, multiplier: 60 * 8 },
  { regex: /(\d+)\s*d$/i, multiplier: 60 * 8 },

  // Weeks (5 working days)
  { regex: /(\d+)\s*(tuần|tuan|week|w)$/i, multiplier: 60 * 8 * 5 },
  { regex: /(\d+)\s*w$/i, multiplier: 60 * 8 * 5 },

  // Months (4 weeks)
  { regex: /(\d+)\s*(tháng|thang|month|mo)$/i, multiplier: 60 * 8 * 5 * 4 },
  { regex: /(\d+)\s*mo$/i, multiplier: 60 * 8 * 5 * 4 },
];

export const parseTimeEstimate = (input: string): ParsedTime | null => {
  if (!input?.trim()) return null;

  const cleanInput = input.toLowerCase().trim();

  // Try patterns in order
  for (const pattern of TIME_PATTERNS) {
    const match = cleanInput.match(pattern.regex);
    if (!match) continue;

    if (pattern.isComplex) {
      return parseComplexTime(match);
    }

    if (pattern.isDecimal) {
      return parseDecimalTime(match, pattern.multiplier!);
    }

    return parseSimpleTime(match, pattern.multiplier!);
  }

  // Try parsing pure numbers (assume minutes)
  const numberMatch = cleanInput.match(/^(\d+)$/);
  if (numberMatch) {
    const number = parseInt(numberMatch[1]);
    return { minutes: number, displayText: `${number}m` };
  }

  return null;
};

const parseComplexTime = (match: RegExpMatchArray): ParsedTime => {
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const totalMinutes = hours * 60 + minutes;

  let displayText = '';
  if (hours > 0 && minutes > 0) {
    displayText = `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    displayText = `${hours}h`;
  } else {
    displayText = `${minutes}m`;
  }

  return { minutes: totalMinutes, displayText };
};

const parseDecimalTime = (match: RegExpMatchArray, multiplier: number): ParsedTime => {
  const decimalValue = parseFloat(match[1].replace(',', '.'));
  const totalMinutes = Math.round(decimalValue * multiplier);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  let displayText = '';
  if (hours > 0 && mins > 0) {
    displayText = `${hours}h ${mins}m`;
  } else if (hours > 0) {
    displayText = `${hours}h`;
  } else {
    displayText = `${mins}m`;
  }

  return { minutes: totalMinutes, displayText };
};

const parseSimpleTime = (match: RegExpMatchArray, multiplier: number): ParsedTime => {
  const number = parseInt(match[1]);
  const totalMinutes = number * multiplier;

  const displayText = getDisplayText(multiplier, number);
  return { minutes: totalMinutes, displayText };
};

const getDisplayText = (multiplier: number, number: number): string => {
  switch (multiplier) {
    case 1:
      return `${number}m`;
    case 60:
      return `${number}h`;
    case 60 * 8:
      return `${number}d`;
    case 60 * 8 * 5:
      return `${number}w`;
    case 60 * 8 * 5 * 4:
      return `${number}mo`;
    default:
      return `${number}m`;
  }
};

export const formatMinutesToText = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${remainingMinutes} phút`;
};

export const EXAMPLE_TIME_VALUES = ['30m', '2h', '1d', '1 tuần', '2h30m'];

export const TIME_INPUT_TOOLTIP =
  'Hỗ trợ: phút (m, phút), giờ (h, tiếng), ngày (d, ngày), tuần (w, tuần), tháng (mo, tháng). Có thể kết hợp như "2h30m"';

export const isValidTimeInput = (input: string): boolean => {
  return parseTimeEstimate(input) !== null;
};

export const convertMinutesToDisplayText = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};
