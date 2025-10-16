import { useDebounce } from '@/hooks/useDebounce';
import { formatMinutesToText } from '@/utils/formatter';
import { EXAMPLE_TIME_VALUES, parseTimeEstimate, TIME_INPUT_TOOLTIP } from '@/utils/times';
import { IconHelpOctagonFilled } from '@tabler/icons-react';
import { Button, Input, message, Space, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

interface EstimateContentProps {
  estimateTime: number | undefined | string;
  onEstimateChange: (value: string) => void;
}

const EstimateContent = ({ estimateTime, onEstimateChange }: EstimateContentProps) => {
  const [inputValue, setInputValue] = useState<string>(estimateTime ? `${estimateTime}m` : '');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [parsedValue, setParsedValue] = useState<{ minutes: number; displayText: string } | null>(
    null,
  );

  const debouncedInput = useDebounce(inputValue, 400);

  const onEstimateChangeRef = useRef(onEstimateChange);
  useEffect(() => {
    onEstimateChangeRef.current = onEstimateChange;
  }, [onEstimateChange]);

  useEffect(() => {
    if (estimateTime === undefined || estimateTime === null) {
      setInputValue('');
      setParsedValue(null);
      setIsValid(true);
    }
  }, [estimateTime]);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setParsedValue(null);
      setIsValid(true);
      onEstimateChangeRef.current('');
      return;
    }
    const parsed = parseTimeEstimate(debouncedInput);
    setParsedValue(parsed);
    setIsValid(!!parsed);
    if (parsed) {
      onEstimateChangeRef.current(parsed.displayText);
    }
  }, [debouncedInput]);
  // removed onEstimateChange from deps -> use ref instead

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const parsed = parseTimeEstimate(e.target.value);
    setParsedValue(parsed);
    setIsValid(!!parsed);
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
      if (inputValue.trim() && /^\d+$/.test(inputValue.trim()) && !parsedValue) {
        const number = parseInt(inputValue.trim());
        const defaultParsed = { minutes: number, displayText: `${number}m` };
        setParsedValue(defaultParsed);
        setIsValid(true);
        setInputValue(defaultParsed.displayText);
        onEstimateChangeRef.current(defaultParsed.displayText);
      } else if (parsedValue && isValid) {
        setInputValue(parsedValue.displayText);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (inputValue.trim() && /^\d+$/.test(inputValue.trim()) && !parsedValue) {
        const number = parseInt(inputValue.trim());
        const defaultParsed = { minutes: number, displayText: `${number}m` };
        setParsedValue(defaultParsed);
        setIsValid(true);
        setInputValue(defaultParsed.displayText);
        onEstimateChangeRef.current(defaultParsed.displayText);
      }
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography style={{ padding: '0 12px', fontWeight: 600 }}>Ước lượng thời gian</Typography>
      <div style={{ padding: '0 12px 8px', borderBottom: '1px solid #f0f0f0' }}>
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
      <div style={{ padding: '0 12px 8px', borderBottom: '1px solid #f0f0f0' }}>
        <Typography.Text
          style={{ fontSize: 12, color: '#838383', display: 'block', marginBottom: 4 }}
        >
          Ví dụ:
        </Typography.Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {EXAMPLE_TIME_VALUES.map(example => (
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
                  onEstimateChangeRef.current(parsed.displayText);
                }
              }}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: '0 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Tooltip title={TIME_INPUT_TOOLTIP}>
          <IconHelpOctagonFilled size={14} color="#838383" />
        </Tooltip>
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          Enter để xác nhận
        </Typography.Text>
      </div>
    </Space>
  );
};

export default EstimateContent;
