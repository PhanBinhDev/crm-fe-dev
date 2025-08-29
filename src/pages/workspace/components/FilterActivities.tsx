import { IconFilter } from '@tabler/icons-react';
import { Button, Popover, Tooltip } from 'antd';

const FilterActivities = () => {
  return (
    <Popover placement="bottomLeft" trigger="click">
      <Tooltip title="Lọc hoạt động">
        <Button
          icon={<IconFilter size={16} color="#8c8c8c" />}
          style={{
            borderRadius: 8,
            background: '#f5f5f5',
            width: 36,
            height: 36,
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        />
      </Tooltip>
    </Popover>
  );
};

export default FilterActivities;
