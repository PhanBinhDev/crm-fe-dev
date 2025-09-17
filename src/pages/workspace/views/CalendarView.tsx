import { IActivity, IStage } from '@/common/types';
import { IconPlayerRecordFilled } from '@tabler/icons-react';
import { Calendar, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
const { Text } = Typography;

interface CalendarViewProps {
  stages: IStage[];
  activities: IActivity[];
}

const CalendarView = ({ stages, activities }: CalendarViewProps) => {
  const dateCellRender = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const dayTasks = activities.filter(
      t => t.endTime && dayjs(t.endTime).format('YYYY-MM-DD') === date,
    );

    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {dayTasks.map(task => (
          <li key={task.id}>
            <Space size="small" style={{ flex: 1, gap: 4 }}>
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  backgroundColor: stages.find(s => s.id === task.stageId)?.color || 'blue',
                  padding: '4px 8px 4px 6px',
                  borderRadius: '6px',
                }}
              >
                <IconPlayerRecordFilled size={7} color="#fff" />
                <Text
                  style={{
                    fontSize: 12,
                    lineHeight: '13px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {task.name}
                </Text>
              </div>
            </Space>
          </li>
        ))}
      </ul>
    );
  };

  return <Calendar dateCellRender={dateCellRender} />;
};

export default CalendarView;
