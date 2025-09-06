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

  return (
    <Button
      ref={ref}
      size="small"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={defaultClassNames.day}
      {...buttonProps}
      type="text"
    >
      {day.date.getDate()}
    </Button>
  );
}
