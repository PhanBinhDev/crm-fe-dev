import { IActivity } from '@/common/types';
import { getPriorityLabel } from '@/constants';
import { getActivityPriorityColor } from '@/utils/activity';
import {
  IconCalendar,
  IconFlag,
  IconFlagFilled,
  IconPlaystationCircle,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { Avatar, Button, Popover } from 'antd';
import ActivityContentItem from './ActivityContentItem';

interface ActivityMainContentProps {
  isContentNarrow: boolean;
  itemData: IActivity;
}

const ActivityMainContent = ({ isContentNarrow, itemData }: ActivityMainContentProps) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isContentNarrow ? '1fr' : 'repeat(2, 1fr)',
        gridTemplateRows: isContentNarrow ? 'repeat(6, auto)' : 'repeat(3, auto)',
        gap: 16,
        width: '100%',
      }}
    >
      <ActivityContentItem
        startContent={
          <>
            <IconPlaystationCircle size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Trạng thái
            </span>
          </>
        }
        endContent={
          <Popover>
            <Button
              type="text"
              size="small"
              style={{
                padding: '0 6px',
                background: itemData?.stage?.color || '#f0f0f0',
                color: '#fff',
                borderRadius: 7,
                fontSize: 14,
              }}
            >
              {itemData?.stage?.title.toLocaleUpperCase()}
            </Button>
          </Popover>
        }
      />

      <ActivityContentItem
        startContent={
          <>
            <IconUsers size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Phụ trách
            </span>
          </>
        }
        endContent={
          <>
            <Popover>
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  borderRadius: 7,
                  fontSize: 14,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '';
                }}
              >
                {!itemData.assignees?.length
                  ? 'Trống'
                  : itemData.assignees.map(assignee => (
                      <Avatar
                        key={assignee.id}
                        size={'small'}
                        src={assignee.user.avatar}
                        style={{ marginRight: 4 }}
                      />
                    ))}
              </Button>
            </Popover>

            <Button
              type="text"
              size="small"
              style={{
                borderRadius: 6,
                padding: '0 6px',
              }}
            >
              <IconX size={15} color={'#838383'} />
            </Button>
          </>
        }
      />

      <ActivityContentItem
        startContent={
          <>
            <IconCalendar size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Hạn
            </span>
          </>
        }
        endContent={
          <>
            <Popover>
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  background: 'transparent',
                  borderRadius: 7,
                  fontSize: 14,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {!itemData.endTime
                  ? 'Trống'
                  : new Date(itemData.endTime).toLocaleDateString('vi-VN')}
              </Button>
            </Popover>

            <Button
              type="text"
              size="small"
              style={{
                borderRadius: 6,
                padding: '0 6px',
              }}
            >
              <IconX size={15} color={'#838383'} />
            </Button>
          </>
        }
      />

      <ActivityContentItem
        startContent={
          <>
            <IconFlag size={14} />
            <span
              style={{
                userSelect: 'none',
              }}
            >
              Ưu tiên
            </span>
          </>
        }
        endContent={
          <>
            <Popover>
              <Button
                type="text"
                size="small"
                style={{
                  padding: '6px',
                  color: '#8c8c8c',
                  background: 'transparent',
                  borderRadius: 7,
                  fontSize: 14,
                }}
                styles={{
                  icon: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
                icon={
                  !itemData.priority ? null : (
                    <IconFlagFilled size={14} color={getActivityPriorityColor(itemData.priority)} />
                  )
                }
              >
                {!itemData.priority ? 'Trống' : getPriorityLabel(itemData.priority)}
              </Button>
            </Popover>

            <Button
              type="text"
              size="small"
              style={{
                borderRadius: 6,
                padding: '0 6px',
              }}
            >
              <IconX size={15} color={'#838383'} />
            </Button>
          </>
        }
      />
    </div>
  );
};

export default ActivityMainContent;
