import { IActivity } from '@/common/types';
import { IconDots } from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'antd';

interface ToolbarMoreActionProps {
  activity: IActivity;
}

const ToolbarMoreAction = ({ activity }: ToolbarMoreActionProps) => {
  const toolbarMoreActionContent = <div>hello</div>;

  return (
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
      content={toolbarMoreActionContent}
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
  );
};

export default ToolbarMoreAction;
