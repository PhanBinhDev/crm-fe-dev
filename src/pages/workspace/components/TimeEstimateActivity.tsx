import { useDebounce } from '@/hooks/useDebounce';
import { IconHelpOctagonFilled, IconHourglassEmpty } from '@tabler/icons-react';
import { Button, Input, Popover, Space, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';

interface TimeEstimateActivityProps {
  value?: string;
  onChange?: (value: string) => void;
}

// Natural language time parser
const parseTimeEstimate = (input: string): { minutes: number; displayText: string } | null => {
  if (!input.trim()) return null;

  const cleanInput = input.toLowerCase().trim();

  // Vietnamese patterns
  const patterns = [
    // Minutes
    { regex: /(\d+)\s*(phút|phut|p|min|m)$/i, multiplier: 1 },
    { regex: /(\d+)\s*p$/i, multiplier: 1 },

    // Hours
    { regex: /(\d+)\s*(tiếng|tiengs|giờ|gio|h|hr|hour)$/i, multiplier: 60 },
    { regex: /(\d+)\s*h$/i, multiplier: 60 },
    { regex: /(\d+)\s*(tieng|gio)$/i, multiplier: 60 },

    // Hours with minutes (e.g., "1h30m", "2 tiếng 15 phút")
    { regex: /(\d+)\s*(?:tiếng|gio|h)\s*(\d+)\s*(?:phút|phut|p|m)$/i, isComplex: true },
    { regex: /(\d+)h\s*(\d+)m?$/i, isComplex: true },

    // Days
    { regex: /(\d+)\s*(ngày|ngay|day|d)$/i, multiplier: 60 * 8 }, // 8 working hours per day
    { regex: /(\d+)\s*d$/i, multiplier: 60 * 8 },

    // Weeks
    { regex: /(\d+)\s*(tuần|tuan|week|w)$/i, multiplier: 60 * 8 * 5 }, // 5 working days per week
    { regex: /(\d+)\s*w$/i, multiplier: 60 * 8 * 5 },

    // Months
    { regex: /(\d+)\s*(tháng|thang|month|mo)$/i, multiplier: 60 * 8 * 5 * 4 }, // 4 weeks per month
    { regex: /(\d+)\s*mo$/i, multiplier: 60 * 8 * 5 * 4 },

    // Decimal hours (e.g., "2.5h", "1,5 tiếng")
    { regex: /(\d+(?:[.,]\d+)?)\s*(?:tiếng|gio|h|hour)$/i, multiplier: 60, isDecimal: true },
  ];

  for (const pattern of patterns) {
    const match = cleanInput.match(pattern.regex);
    if (match) {
      if (pattern.isComplex) {
        // Handle complex patterns like "1h30m"
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
      } else if (pattern.isDecimal) {
        // Handle decimal hours
        const decimalHours = parseFloat(match[1].replace(',', '.'));
        const totalMinutes = Math.round(decimalHours * 60);
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
      } else {
        // Handle simple patterns
        const number = parseInt(match[1]);
        const multiplier = pattern.multiplier ?? 1;
        const totalMinutes = number * multiplier;

        let displayText = '';
        if (multiplier === 1) {
          displayText = `${number}m`;
        } else if (multiplier === 60) {
          displayText = `${number}h`;
        } else if (multiplier === 60 * 8) {
          displayText = `${number}d`;
        } else if (multiplier === 60 * 8 * 5) {
          displayText = `${number}w`;
        } else if (multiplier === 60 * 8 * 5 * 4) {
          displayText = `${number}mo`;
        }

        return { minutes: totalMinutes, displayText };
      }
    }
  }

  // Try to parse just numbers (assume minutes)
  const numberMatch = cleanInput.match(/^(\d+)$/);
  if (numberMatch) {
    const number = parseInt(numberMatch[1]);
    return { minutes: number, displayText: `${number}m` };
  }

  return null;
};

// Format minutes back to readable text
const formatMinutesToText = (minutes: number): string => {
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
    const days = Math.floor(minutes / (60 * 8)); // 8 working hours per day
    return `${days} ngày`;
  } else if (minutes < 60 * 24 * 30) {
    const weeks = Math.floor(minutes / (60 * 8 * 5)); // 5 working days per week
    return `${weeks} tuần`;
  } else {
    const months = Math.floor(minutes / (60 * 8 * 5 * 4)); // 4 weeks per month
    return `${months} tháng`;
  }
};

const TimeEstimateActivity = ({ value, onChange }: TimeEstimateActivityProps) => {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const debouncedInput = useDebounce(inputValue, 400);
  const [parsedValue, setParsedValue] = useState<{ minutes: number; displayText: string } | null>(
    null,
  );
  const [isValid, setIsValid] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setParsedValue(null);
      setIsValid(true);
      onChange?.('');
      return;
    }
    const parsed = parseTimeEstimate(debouncedInput);
    setParsedValue(parsed);
    setIsValid(!!parsed);
    if (parsed) {
      onChange?.(parsed.displayText);
    }
  }, [debouncedInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (parsedValue && isValid) {
      setInputValue(parsedValue.displayText);
    } else if (!isValid && inputValue.trim()) {
      message.warning(
        'Định dạng thời gian không hợp lệ. Vui lòng thử lại với format như "2h", "30m", "1d"',
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // When user presses Enter, finalize the input
      if (inputValue.trim() && /^\d+$/.test(inputValue.trim()) && !parsedValue) {
        // If it's just a number, default to minutes
        const number = parseInt(inputValue.trim());
        const defaultParsed = { minutes: number, displayText: `${number}m` };
        setParsedValue(defaultParsed);
        setIsValid(true);
        setInputValue(defaultParsed.displayText);
        onChange?.(defaultParsed.displayText);
      } else if (parsedValue && isValid) {
        setInputValue(parsedValue.displayText);
      }
      setOpen(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Similar logic for Tab key
      if (inputValue.trim() && /^\d+$/.test(inputValue.trim()) && !parsedValue) {
        const number = parseInt(inputValue.trim());
        const defaultParsed = { minutes: number, displayText: `${number}m` };
        setParsedValue(defaultParsed);
        setIsValid(true);
        setInputValue(defaultParsed.displayText);
        onChange?.(defaultParsed.displayText);
      }
    }
  };

  const getButtonText = () => {
    if (parsedValue && isValid) {
      return parsedValue.displayText;
    }
    return 'Ước lượng';
  };

  const getButtonColor = () => {
    return parsedValue && isValid ? '#1890ff' : '#838383';
  };

  const timeEstimateContent = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Typography
        style={{
          padding: '0 12px',
          fontWeight: 600,
        }}
      >
        Ước lượng thời gian
      </Typography>

      {/* Input */}
      <div
        style={{
          padding: '0 12px 8px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Input
          placeholder='vd: "2h", "30m", "1d", "2 tuần"'
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          status={!isValid && inputValue.trim() ? 'error' : undefined}
          autoFocus
        />
        {parsedValue && isValid && (
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, marginTop: 4, display: 'block' }}
          >
            = {formatMinutesToText(parsedValue.minutes)}
          </Typography.Text>
        )}
        {!isValid && inputValue.trim() && (
          <Typography.Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            Định dạng không hợp lệ
          </Typography.Text>
        )}
      </div>

      {/* Examples */}
      <div style={{ padding: '0 12px 8px', borderBottom: '1px solid #f0f0f0' }}>
        <Typography.Text
          style={{ fontSize: 12, color: '#838383', display: 'block', marginBottom: 4 }}
        >
          Ví dụ:
        </Typography.Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {['30m', '2h', '1d', '1 tuần', '2h30m'].map(example => (
            <Button
              key={example}
              size="small"
              type="text"
              style={{
                fontSize: 11,
                height: 20,
                padding: '0 6px',
                color: '#1890ff',
                border: '1px solid #d9d9d9',
              }}
              onClick={() => {
                setInputValue(example);
                const parsed = parseTimeEstimate(example);
                setParsedValue(parsed);
                setIsValid(!!parsed);
                if (parsed) {
                  onChange?.(parsed.displayText);
                }
              }}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>

      {/* Guideline */}
      <div
        style={{
          padding: '0 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Tooltip title='Hỗ trợ: phút (m, phút), giờ (h, tiếng), ngày (d, ngày), tuần (w, tuần), tháng (mo, tháng). Có thể kết hợp như "2h30m"'>
          <IconHelpOctagonFilled size={14} color="#838383" />
        </Tooltip>

        <Typography.Text
          style={{
            fontSize: 12,
          }}
          type="secondary"
        >
          Enter để xác nhận
        </Typography.Text>
      </div>
    </Space>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      styles={{
        body: {
          padding: '12px 0',
          width: 280,
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      arrow={false}
      content={timeEstimateContent}
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: getButtonColor(),
          borderColor: parsedValue && isValid ? '#1890ff' : undefined,
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconHourglassEmpty size={12} />}
      >
        {getButtonText()}
      </Button>
    </Popover>
  );
};

export default TimeEstimateActivity;
