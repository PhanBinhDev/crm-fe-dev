import { IMember } from '@/common/types';
import { IconDots } from '@tabler/icons-react';
import { Button, Popover } from 'antd';

interface MemberRowActionProps {
  member: IMember;
}

const MemberRowAction = ({}: MemberRowActionProps) => {
  return (
    <Popover
      trigger={['click']}
      content={<div>Actions here</div>}
      arrow={false}
      placement="left"
      styles={{
        body: {
          width: 180,
        },
      }}
    >
      <Button
        icon={<IconDots size={16} color="#333" />}
        type="text"
        style={{
          padding: '4px 12px',
        }}
        styles={{
          icon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      />
    </Popover>
  );
};

export default MemberRowAction;
