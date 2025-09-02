import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Button } from 'antd';
import React from 'react';
import { DayButton, DayPicker, DayPickerProps, getDefaultClassNames } from 'react-day-picker';

const CustomCalendar = (props: DayPickerProps) => {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={true}
      captionLayout="label"
      formatters={{
        formatMonthDropdown: date => date.toLocaleString('default', { month: 'short' }),
        ...props.formatters,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'down') {
            return <IconChevronDown size={16} className={className} {...props} />;
          }

          if (orientation === 'up') {
            return <IconChevronUp size={16} className={className} {...props} />;
          }

          return <IconChevronDown size={16} className={className} {...props} />;
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
};

export default CustomCalendar;

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  // Omit 'color' from props to avoid type error
  const { color, ...buttonProps } = props;

  const getButtonStyle = () => {
    // Màu chính
    const primary = '#7c3aed';
    const accent = '#e0e7ff';

    // Range middle
    if (modifiers.range_middle) {
      return {
        background: accent,
        color: primary,
        borderRadius: 0,
      };
    }
    // Range start
    if (modifiers.range_start) {
      return {
        background: primary,
        color: '#fff',
        borderRadius: '6px 0 0 6px',
      };
    }
    // Range end
    if (modifiers.range_end) {
      return {
        background: primary,
        color: '#fff',
        borderRadius: '0 6px 6px 0',
      };
    }
    // Selected single
    if (
      modifiers.selected &&
      !modifiers.range_start &&
      !modifiers.range_end &&
      !modifiers.range_middle
    ) {
      return {
        background: primary,
        color: '#fff',
        borderRadius: 6,
      };
    }
    // Today
    if (modifiers.today) {
      return {
        border: `1px solid ${primary}`,
      };
    }
    // Disabled
    if (modifiers.disabled) {
      return {
        color: '#ccc',
        cursor: 'not-allowed',
      };
    }
    // Outside
    if (modifiers.outside) {
      return {
        color: '#ccc',
      };
    }
    // Default
    return {
      background: 'none',
      color: '#222',
      borderRadius: 6,
    };
  };

  return (
    <Button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      style={{
        width: 32,
        height: 32,
        minWidth: 32,
        padding: 0,
        fontSize: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 400,
        ...getButtonStyle(),
      }}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      {...buttonProps}
      type="text"
    >
      {day.date.getDate()}
    </Button>
  );
}
