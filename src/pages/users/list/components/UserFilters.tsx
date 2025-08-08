import { FC } from 'react';
import { Input, Select, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { UserRole } from '@/common/enum/user';
import { userRoleFilterOptions, userStatusFilterOptions } from '@/constants/user';

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
  const handleStatusChange = (value: string | undefined) => {
    if (value === undefined) {
      onStatusFilter(undefined);
    } else {
      onStatusFilter(value === 'true');
    }
  };

  return (
    <Space wrap>
      <Search
        placeholder="Tìm kiếm người dùng..."
        allowClear
        value={searchValue}
        onSearch={onSearch}
        onChange={e => onSearch(e.target.value)}
        style={{ width: 250 }}
      />
      <Select
        placeholder="Lọc theo vai trò"
        allowClear
        value={roleValue}
        style={{ width: 150 }}
        onChange={onRoleFilter}
        options={userRoleFilterOptions}
      />
      <Select
        placeholder="Lọc theo trạng thái"
        allowClear
        value={statusValue !== undefined ? statusValue.toString() : undefined}
        style={{ width: 150 }}
        onChange={handleStatusChange}
        options={userStatusFilterOptions}
      />
      <Button icon={<ReloadOutlined />} onClick={onReset}>
        Đặt lại bộ lọc
      </Button>
    </Space>
  );
};
