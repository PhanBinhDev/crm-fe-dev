import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isPrevMonth: boolean;
  date: Date;
}

interface CalendarProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  disabled?: boolean;
}

const RangeCalendar: React.FC<CalendarProps> = ({ value, onChange, disabled = false }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    value || { start: null, end: null },
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const months: string[] = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const weekDays: string[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      setSelectedRange(value);
    }
  }, [value]);

  // Generate calendar days
  const getCalendarDays = useCallback((): CalendarDay[] => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const calendarDays: CalendarDay[] = [];

    // Previous month days
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, daysInPrevMonth - i),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      });
    }

    // Next month days to fill remaining slots
    const remainingSlots = 42 - calendarDays.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
      });
    }

    return calendarDays;
  }, [currentDate]);

  // Navigation functions
  const goToPrevMonth = useCallback((): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }, [currentDate]);

  const goToNextMonth = useCallback((): void => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }, [currentDate]);

  const goToToday = useCallback((): void => {
    setCurrentDate(new Date());
  }, []);

  // Date comparison helpers
  const isSameDay = useCallback((date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  }, []);

  const isToday = useCallback(
    (date: Date): boolean => {
      return isSameDay(date, new Date());
    },
    [isSameDay],
  );

  const isInRange = useCallback(
    (date: Date): boolean => {
      if (!selectedRange.start || !selectedRange.end) return false;
      return date >= selectedRange.start && date <= selectedRange.end;
    },
    [selectedRange],
  );

  const isRangeStart = useCallback(
    (date: Date): boolean => {
      return selectedRange.start ? isSameDay(date, selectedRange.start) : false;
    },
    [selectedRange.start, isSameDay],
  );

  const isRangeEnd = useCallback(
    (date: Date): boolean => {
      return selectedRange.end ? isSameDay(date, selectedRange.end) : false;
    },
    [selectedRange.end, isSameDay],
  );

  // Preview range calculation
  const getPreviewRange = useCallback((): DateRange => {
    if (!selectedRange.start || selectedRange.end || !hoveredDate) {
      return { start: null, end: null };
    }

    return {
      start: selectedRange.start <= hoveredDate ? selectedRange.start : hoveredDate,
      end: selectedRange.start <= hoveredDate ? hoveredDate : selectedRange.start,
    };
  }, [selectedRange, hoveredDate]);

  const isInPreviewRange = useCallback(
    (date: Date): boolean => {
      const previewRange = getPreviewRange();
      if (!previewRange.start || !previewRange.end) return false;
      return date >= previewRange.start && date <= previewRange.end;
    },
    [getPreviewRange],
  );

  // Date selection handler
  const handleDateClick = useCallback(
    (date: Date, isCurrentMonth: boolean): void => {
      if (!isCurrentMonth || disabled) return;

      let newRange: DateRange;

      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        // Start new range
        newRange = { start: date, end: null };
      } else {
        // Complete range
        const start = selectedRange.start;
        const end = date;
        newRange = {
          start: start <= end ? start : end,
          end: start <= end ? end : start,
        };
      }

      setSelectedRange(newRange);
      onChange?.(newRange);
    },
    [selectedRange, disabled, onChange],
  );

  // Get day button style - This is the key fix for hover issue
  const getDayButtonStyle = useCallback(
    (date: Date, isCurrentMonth: boolean): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        border: 'none',
        borderRadius: '6px',
        cursor: isCurrentMonth ? 'pointer' : 'default',
        transition: 'none', // Remove transition to prevent flicker
        backgroundColor: 'transparent',
        position: 'relative',
        fontWeight: '400',
      };

      if (!isCurrentMonth) {
        return {
          ...baseStyle,
          color: '#d9d9d9',
          cursor: 'default',
          pointerEvents: 'none',
        };
      }

      const isStart = isRangeStart(date);
      const isEnd = isRangeEnd(date);
      const isInCurrentRange = isInRange(date);
      const isInCurrentPreviewRange = isInPreviewRange(date);
      const isTodayDate = isToday(date);

      if (isStart || isEnd) {
        return {
          ...baseStyle,
          backgroundColor: '#000',
          color: '#fff',
          fontWeight: '600',
        };
      } else if (isInCurrentRange || isInCurrentPreviewRange) {
        return {
          ...baseStyle,
          backgroundColor: '#e6f7ff',
          color: '#1890ff',
        };
      } else if (isTodayDate) {
        return {
          ...baseStyle,
          backgroundColor: '#1890ff',
          color: '#fff',
          fontWeight: '500',
        };
      } else {
        return {
          ...baseStyle,
          color: '#262626',
        };
      }
    },
    [isRangeStart, isRangeEnd, isInRange, isInPreviewRange, isToday],
  );

  // Hover handlers
  const handleMouseEnter = useCallback(
    (date: Date, isCurrentMonth: boolean): void => {
      if (isCurrentMonth && !disabled && selectedRange.start && !selectedRange.end) {
        setHoveredDate(date);
      }
    },
    [disabled, selectedRange],
  );

  const handleMouseLeave = useCallback((): void => {
    setHoveredDate(null);
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      maxWidth: '350px',
      margin: '20px auto',
      backgroundColor: '#fff',
      border: '1px solid #d9d9d9',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #f0f0f0',
    },
    monthTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#262626',
      margin: 0,
    },
    navButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    calendarGrid: {
      padding: '16px',
    },
    weekHeader: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
      marginBottom: '8px',
    },
    weekDay: {
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: '500',
      color: '#8c8c8c',
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
    },
  };

  const calendarDays = getCalendarDays();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.monthTitle}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <div style={styles.navButtons}>
          <Button
            type="text"
            size="small"
            onClick={goToToday}
            disabled={disabled}
            style={{ color: '#595959', fontSize: '12px', fontWeight: '500' }}
          >
            Hôm nay
          </Button>

          <Button
            type="text"
            size="small"
            icon={<UpOutlined style={{ fontSize: '12px' }} />}
            onClick={goToPrevMonth}
            disabled={disabled}
            style={{ color: '#8c8c8c' }}
          />

          <Button
            type="text"
            size="small"
            icon={<DownOutlined style={{ fontSize: '12px' }} />}
            onClick={goToNextMonth}
            disabled={disabled}
            style={{ color: '#8c8c8c' }}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={styles.calendarGrid}>
        {/* Week Days Header */}
        <div style={styles.weekHeader}>
          {weekDays.map(day => (
            <div key={day} style={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={styles.daysGrid}>
          {calendarDays.map((calendarDay, index) => {
            const { date, isCurrentMonth } = calendarDay;

            return (
              <button
                key={index}
                style={getDayButtonStyle(date, isCurrentMonth)}
                onClick={() => handleDateClick(date, isCurrentMonth)}
                onMouseEnter={() => handleMouseEnter(date, isCurrentMonth)}
                onMouseLeave={handleMouseLeave}
                disabled={!isCurrentMonth || disabled}
              >
                {calendarDay.day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RangeCalendar;
