import { FC, useState } from 'react';
import { Input, Select, Button, Popover, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { UserRole } from '@/common/enum/user';
import { userStatusFilterOptions } from '@/constants/user';
import { IconFilter2, IconUser, IconUserCog, IconUserStar } from '@tabler/icons-react';

const userRoleFilterOptionsWithLabel = [
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconUserStar size={16} color="#ff8000" /> Trưởng môn
      </span>
    ),
    value: 'TM',
  },
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconUserCog size={16} color="#0072bc" /> Chủ nhiệm bộ môn
      </span>
    ),
    value: 'CNBM',
  },
  {
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconUser size={16} color="#00923f" /> Giáo viên
      </span>
    ),
    value: 'GV',
  },
];

const { Search } = Input;

interface UserFiltersProps {
  searchValue?: string;
  roleValue?: UserRole;
  statusValue?: boolean;
  onSearch: (value: string) => void;
  onRoleFilter: (value: UserRole | undefined) => void;
  onStatusFilter: (value: boolean | undefined) => void;
  onReset: () => void;
}

export const UserFilters: FC<UserFiltersProps> = ({
  searchValue,
  roleValue,
  statusValue,
  onSearch,
  onRoleFilter,
  onStatusFilter,
  onReset,
}) => {
  const [open, setOpen] = useState(false);

  const handleStatusChange = (value: string | undefined) => {
    if (value === undefined) {
      onStatusFilter(undefined);
    } else {
      onStatusFilter(value === 'true');
    }
  };

  const filterContent = (
    <Space direction="vertical" style={{ minWidth: 260 }}>
      <Select
        placeholder="Lọc theo vai trò"
        allowClear
        value={roleValue}
        style={{ width: '100%' }}
        onChange={onRoleFilter}
        options={userRoleFilterOptionsWithLabel}
      />
      <Select
        placeholder="Lọc theo trạng thái"
        allowClear
        value={statusValue !== undefined ? statusValue.toString() : undefined}
        style={{ width: '100%' }}
        onChange={handleStatusChange}
        options={userStatusFilterOptions}
      />
      <Button icon={<ReloadOutlined />} onClick={onReset} block>
        Đặt lại bộ lọc
      </Button>
    </Space>
  );

  return (
    <Space>
      <Search
        placeholder="Tìm kiếm người dùng..."
        allowClear
        value={searchValue}
        onSearch={onSearch}
        onChange={e => onSearch(e.target.value)}
        style={{ width: 250 }}
      />
      <Popover
        content={filterContent}
        title="Bộ lọc"
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomLeft"
      >
        <Button
          icon={<IconFilter2 size={16} />}
          style={{
            borderRadius: 8,
            background: open ? '#f5f5f5' : undefined,
            boxShadow: open ? '0 2px 8px rgba(0,0,0,0.08)' : undefined,
            gap: 4,
          }}
          styles={{
            icon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          Filters
        </Button>
      </Popover>
    </Space>
  );
};
