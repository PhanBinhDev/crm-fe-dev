import { IActivity, IStage } from '@/common/types';
import { useModal } from '@/hooks/useModal';
import { IconPlayerRecordFilled } from '@tabler/icons-react';
import { Calendar, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
const { Text } = Typography;

interface CalendarViewProps {
  stages: IStage[];
  activities: IActivity[];
}

const CalendarView = ({ stages, activities }: CalendarViewProps) => {
  const { openModal } = useModal();
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
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: stages.find(s => s.id === task.stageId)?.color || 'blue',
                  padding: '2px 5px',
                  borderRadius: '6px',
                  maxWidth: '100%',
                }}
                onClick={() => openModal('ModalEditActivity', { activity: task })}
              >
                <IconPlayerRecordFilled size={10} color="#fff" />
                <Text
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    lineHeight: '1.4em',
                    maxHeight: '1.4em',
                    flex: 1,
                    minWidth: 0,
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
