import { DateRange } from '@/common/types';
import { IconCalendar, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Button, Calendar, Input, Popover, Space, message } from 'antd';

import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

const isDateInPast = (date: Dayjs): boolean => {
  return date.isBefore(dayjs(), 'minute');
};

const presetOptions = [
  {
    label: 'Hôm nay',
    value: () => dayjs().hour(23).minute(59).second(59),
    right: dayjs().format('dd'),
  },
  {
    label: 'Cuối ngày',
    value: () => dayjs().endOf('day'),
    right: dayjs().endOf('day').format('HH:mm'),
  },
  {
    label: 'Ngày mai',
    value: () => dayjs().add(1, 'day').hour(23).minute(59).second(59),
    right: dayjs().add(1, 'day').format('dd'),
  },
  {
    label: 'Cuối tuần này',
    value: () => dayjs().day(6).hour(23).minute(59).second(59),
    right: dayjs().day(6).format('dd'),
  },
  {
    label: 'Tuần sau',
    value: () => dayjs().add(1, 'week').startOf('week').hour(23).minute(59).second(59),
    right: dayjs().add(1, 'week').format('dd'),
  },
  {
    label: 'Cuối tuần sau',
    value: () => dayjs().add(1, 'week').day(6).hour(23).minute(59).second(59),
    right: dayjs().add(1, 'week').day(6).format('DD MMM'),
  },
  {
    label: '2 tuần nữa',
    value: () => dayjs().add(2, 'week').startOf('week').hour(23).minute(59).second(59),
    right: dayjs().add(2, 'week').format('DD MMM'),
  },
  {
    label: '4 tuần nữa',
    value: () => dayjs().add(4, 'week').startOf('week').hour(23).minute(59).second(59),
    right: dayjs().add(4, 'week').format('DD MMM'),
  },
];

const PresetDateSelect = ({
  onSelect,
  selectedPreset,
  onPresetChange,
}: {
  onSelect?: (date: dayjs.Dayjs) => void;
  selectedPreset: string | null;
  onPresetChange?: (preset: string | null) => void;
}) => {
  return (
    <div
      style={{
        width: '45%',
        height: '100%',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      {presetOptions.map(option => {
        const isSelected = selectedPreset === option.label;
        return (
          <div
            key={option.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              color: isSelected ? '#1890ff' : '#444',
              backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              const selectedDate = option.value();
              onSelect?.(selectedDate);
              onPresetChange?.(option.label);
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span>{option.label}</span>
            <span style={{ color: isSelected ? '#1890ff' : '#bfbfbf', fontSize: 13 }}>
              {option.right}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface DuedateActivityProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const DuedateActivity = ({ value, onChange }: DuedateActivityProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: value.start,
    end: value.end,
  });

  const [selectedDate, setSelectedDate] = useState<Dayjs | undefined>(undefined);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'start' | 'end' | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState('Hạn');

  const startInputRef = useRef<any>(null);
  const endInputRef = useRef<any>(null);

  useEffect(() => {
    setDateRange({
      start: value.start,
      end: value.end,
    });
    setSelectedDate(value.end ?? value.start ?? undefined);
  }, [value]);

  // Format date for display in input
  const formatDateForInput = (date: Dayjs | null) => {
    if (!date) return '';
    return date.format('DD/MM/YYYY HH:mm');
  };

  // Parse date from input string
  const parseDateFromInput = (dateString: string): Dayjs | null => {
    if (!dateString.trim()) return null;

    // Try different formats
    const formats = [
      'DD/MM/YYYY HH:mm',
      'DD/MM/YYYY H:mm',
      'DD/MM/YYYY',
      'D/M/YYYY',
      'DD-MM-YYYY',
      'YYYY-MM-DD',
    ];

    for (const format of formats) {
      const parsed = dayjs(dateString, format, true);
      if (parsed.isValid()) {
        // If no time specified, default to end of day
        if (!dateString.includes(':')) {
          return parsed.hour(23).minute(59).second(59);
        }
        return parsed;
      }
    }

    return null;
  };

  // Update button text based on selected dates
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      if (dateRange.start.isSame(dateRange.end, 'day')) {
        setButtonText(dateRange.start.format('DD/MM'));
      } else {
        setButtonText(`${dateRange.start.format('DD/MM')} - ${dateRange.end.format('DD/MM')}`);
      }
    } else if (dateRange.start) {
      setButtonText(dateRange.start.format('DD/MM'));
    } else if (dateRange.end) {
      setButtonText(`Đến ${dateRange.end.format('DD/MM')}`);
    } else {
      setButtonText('Hạn');
    }
  }, [dateRange]);

  const handlePresetSelect = (date: Dayjs) => {
    if (isDateInPast(date)) {
      message.warning('Không thể chọn thời gian trong quá khứ');
      return;
    }

    const newRange = { start: null, end: date };
    setDateRange(newRange);
    setSelectedDate(date);
    setSelectedPreset(null);
    onChange?.(newRange);
  };

  const handleCalendarSelect = (date: Dayjs) => {
    const dateWithTime = date.hour(23).minute(59).second(59);

    if (isDateInPast(dateWithTime)) {
      message.warning('Không thể chọn thời gian trong quá khứ');
      return;
    }

    if (focusedInput === 'start' || (!focusedInput && !dateRange.start)) {
      const newRange = { ...dateRange, start: dateWithTime };
      setDateRange(newRange);
      setFocusedInput('end');
      setSelectedPreset(null);
      onChange?.(newRange);

      setTimeout(() => {
        endInputRef.current?.focus();
      }, 100);
    } else if (focusedInput === 'end' || !dateRange.end) {
      const newRange = { ...dateRange, end: dateWithTime };
      setDateRange(newRange);
      setSelectedPreset(null);
      onChange?.(newRange);
    }

    setSelectedDate(dateWithTime);
  };

  const handleInputChange = (inputValue: string, type: 'start' | 'end') => {
    const parsedDate = parseDateFromInput(inputValue);

    if (parsedDate) {
      if (isDateInPast(parsedDate)) {
        message.error('Không thể chọn thời gian trong quá khứ');
        return;
      }

      setSelectedPreset(null);

      setDateRange(prev => {
        let newRange: DateRange;

        if (type === 'start') {
          if (prev.end && parsedDate.isAfter(prev.end)) {
            message.warning('Ngày bắt đầu không thể sau ngày kết thúc');
            newRange = { start: parsedDate, end: null };
          } else {
            newRange = { ...prev, start: parsedDate };
          }
        } else {
          if (prev.start && parsedDate.isBefore(prev.start)) {
            message.warning('Ngày kết thúc không thể trước ngày bắt đầu');
            newRange = { start: null, end: parsedDate };
          } else {
            newRange = { ...prev, end: parsedDate };
          }
        }

        onChange?.(newRange);
        return newRange;
      });

      setSelectedDate(parsedDate);
    } else if (inputValue === '') {
      setDateRange(prev => {
        const newRange = { ...prev, [type]: null };
        onChange?.(newRange);
        return newRange;
      });
    }
  };

  const handleInputFocus = (type: 'start' | 'end') => {
    setFocusedInput(type);
    const currentDate = type === 'start' ? dateRange.start : dateRange.end;
    if (currentDate) {
      setSelectedDate(currentDate);
    }
  };

  const handlePopoverVisibleChange = (visible: boolean) => {
    setPopoverVisible(visible);
    if (visible) {
      setTimeout(() => {
        endInputRef.current?.focus();
        setFocusedInput('end');
      }, 100);
    } else {
      setFocusedInput(null);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent, type: 'start' | 'end') => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (type === 'start') {
        setFocusedInput('end');
        endInputRef.current?.focus();
      } else {
        setFocusedInput('start');
        startInputRef.current?.focus();
      }
    } else if (e.key === 'Enter') {
      setPopoverVisible(false);
    }
  };

  const handleClear = () => {
    setDateRange({ start: null, end: null });
    setSelectedDate(undefined);
    setSelectedPreset(null);
    setFocusedInput(null);
    onChange?.({ start: null, end: null });
  };

  const disabledDate = (current: Dayjs): boolean => {
    return current && current.isBefore(dayjs(), 'day');
  };

  const popoverContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
      }}
    >
      {/* Two input range */}
      <Space
        style={{
          padding: 8,
          borderBottom: '1px solid #f0f0f0',
        }}
        styles={{
          item: {
            width: '50%',
          },
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <Input
            ref={startInputRef}
            variant="borderless"
            value={formatDateForInput(dateRange.start)}
            onChange={e => handleInputChange(e.target.value, 'start')}
            onFocus={() => handleInputFocus('start')}
            onKeyDown={e => handleInputKeyPress(e, 'start')}
            style={{
              backgroundColor: focusedInput === 'start' ? '#fff' : '#f6f6f6',
              border: focusedInput === 'start' ? '1px solid #1890ff' : '1px solid transparent',
              borderRadius: 6,
            }}
            placeholder="Từ ngày"
            prefix={<IconCalendar size={16} />}
          />
        </div>
        <div style={{ position: 'relative', width: '100%' }}>
          <Input
            ref={endInputRef}
            variant="borderless"
            value={formatDateForInput(dateRange.end)}
            onChange={e => handleInputChange(e.target.value, 'end')}
            onFocus={() => handleInputFocus('end')}
            onKeyDown={e => handleInputKeyPress(e, 'end')}
            style={{
              backgroundColor: focusedInput === 'end' ? '#fff' : '#f6f6f6',
              border: focusedInput === 'end' ? '1px solid #1890ff' : '1px solid transparent',
              borderRadius: 6,
            }}
            placeholder="Đến ngày"
            prefix={<IconCalendar size={16} />}
          />
        </div>
      </Space>

      {/* Content */}
      <div style={{ display: 'flex' }}>
        <PresetDateSelect
          onSelect={handlePresetSelect}
          selectedPreset={selectedPreset}
          onPresetChange={setSelectedPreset}
        />
        <div style={{ flex: 1 }}>
          <Calendar
            fullscreen={false}
            disabledDate={disabledDate}
            headerRender={({ onChange, value }) => {
              const current = value || dayjs();
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    borderBottom: '1px solid #f0f0f0',
                    background: '#fff',
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: 14 }}>
                    {current.format('MMMM YYYY').charAt(0).toUpperCase() +
                      current.format('MMMM YYYY').slice(1)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button
                      type="text"
                      size="small"
                      style={{ fontWeight: 500, color: '#838383', fontSize: 12 }}
                      onClick={() => onChange(dayjs())}
                    >
                      Today
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      styles={{
                        icon: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#838383',
                        },
                      }}
                      icon={<IconChevronUp size={13} />}
                      style={{ padding: 0 }}
                      onClick={() => onChange(current.subtract(1, 'month'))}
                    />
                    <Button
                      type="text"
                      size="small"
                      styles={{
                        icon: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#838383',
                        },
                      }}
                      icon={<IconChevronDown size={13} />}
                      style={{ padding: 0 }}
                      onClick={() => onChange(current.add(1, 'month'))}
                    />
                  </div>
                </div>
              );
            }}
            value={selectedDate}
            onChange={handleCalendarSelect}
          />

          {/* Footer with actions */}
          <div
            style={{
              padding: '8px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              type="text"
              size="small"
              onClick={handleClear}
              style={{ color: '#ff4d4f', fontSize: 12 }}
            >
              Xóa
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => setPopoverVisible(false)}
              disabled={!dateRange.start && !dateRange.end}
            >
              Xong
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Popover
      styles={{
        body: {
          padding: 0,
          width: 480,
        },
      }}
      content={popoverContent}
      trigger={['click']}
      arrow={false}
      open={popoverVisible}
      onOpenChange={handlePopoverVisibleChange}
    >
      <Button
        size="small"
        style={{
          borderRadius: 6,
          gap: 4,
          color: dateRange.start || dateRange.end ? '#1890ff' : '#838383',
          borderColor: dateRange.start || dateRange.end ? '#1890ff' : undefined,
        }}
        styles={{
          icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
        icon={<IconCalendar size={12} />}
      >
        {buttonText}
      </Button>
    </Popover>
  );
};

export default DuedateActivity;
