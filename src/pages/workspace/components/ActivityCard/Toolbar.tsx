import { IActivity } from '@/common/types';
import { IconCheck, IconDots, IconPencil, IconPlus } from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'antd';

interface ToolbarActivityCardProps {
  activity: IActivity;
  isCompletedStage: boolean;
}

const ToolbarActivityCard = ({ activity, isCompletedStage }: ToolbarActivityCardProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        zIndex: 2,
        display: 'flex',
        gap: '4px',
        height: 32,
        width: 'auto',
        background: '#fff',
        borderRadius: 6,
        border: '1px solid #cecece',
        boxShadow: '0 1px 3px rgba(0, 0, 0, .106), 0 1px 2px -1px rgba(0, 0, 0, .106)',
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      {!isCompletedStage && (
        <Tooltip title="Đánh dấu hoàn thành">
          <Button
            size="small"
            type="text"
            icon={<IconCheck size={14} />}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={() => console.log('Mark complete', activity.id)}
          />
        </Tooltip>
      )}

      <Tooltip title="Tạo hoạt động phụ">
        <Button
          size="small"
          type="text"
          icon={<IconPlus size={14} />}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
          onClick={() => console.log('Edit', activity.id)}
        />
      </Tooltip>

      <Tooltip title="Chỉnh sửa">
        <Button
          size="small"
          type="text"
          icon={<IconPencil size={14} />}
          styles={{
            icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
          }}
          onClick={() => console.log('Edit', activity.id)}
        />
      </Tooltip>
      <Popover
        styles={{
          body: {
            padding: 0,
            width: 256,
          },
        }}
        trigger={['click']}
        builtinPlacements={{
          rightTop: {
            points: ['cl', 'cr'],
            offset: [4, 0],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          },
        }}
        placement="bottomLeft"
        arrow={false}
        content={<div>Content</div>}
      >
        <Tooltip title="Thao tác khác">
          <Button
            size="small"
            type="text"
            icon={<IconDots size={14} />}
            styles={{
              icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
            }}
            onClick={() => console.log('Thao tác khác', activity.id)}
          />
        </Tooltip>
      </Popover>
    </div>
  );
};

export default ToolbarActivityCard;
