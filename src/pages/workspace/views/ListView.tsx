import { ActivityPriority } from '@/common/enum/activity';
import { StageGroup } from '@/common/enum/stage';
import { IActivity, IStage, IUser } from '@/common/types';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { useModal } from '@/hooks/useModal';
import '@/styles/table-list.css';
import { getActivityPriorityColor, getActivityPriorityLabel } from '@/utils';
import { getColorFromName, getInitials, useLocalStorageState } from '@/utils/activity';

import {
  AppstoreAddOutlined,
  CalendarOutlined,
  FlagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Checkbox,
  Collapse,
  Dropdown,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useState } from 'react';
const { Panel } = Collapse;
const { Text } = Typography;

interface ListViewProps {
  stages: IStage[];
  activities: IActivity[];
  users: IUser[];
}
interface StatusItem {
  label: string;
  color: string;
  bgColor: string;
  count: number;
}

const ListView = ({ stages, activities, users }: ListViewProps) => {
  const { openModal } = useModal();
  const [activeKeys, setActiveKeys] = useState(['TO DO', 'IN PROGRESS']);

  const stageMap = stages.reduce<Record<string, string>>((acc, stage) => {
    acc[stage.id] = stage.title;
    return acc;
  }, {});

  const groupedTasks = activities.reduce<Record<string, IActivity[]>>((acc, task) => {
    const stageTitle =
      task.stageId !== undefined && stageMap[task.stageId] ? stageMap[task.stageId] : 'Unknown';

    if (!acc[stageTitle]) {
      acc[stageTitle] = [];
    }
    acc[stageTitle].push(task);

    return acc;
  }, {});

  const statusConfig = stages.reduce(
    (acc, stage) => {
      acc[stage.title] = {
        label: stage.title,
        color: stage.color || '#000000',
        bgColor: stage.color || '#000000',
        count: groupedTasks[stage.title]?.length || 0,
      };
      return acc;
    },
    {} as Record<string, StatusItem>,
  );

  const getColumns = () => [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'stt',
      width: 60,
      flex: 'none',
      fixed: 'left' as const,
      render: (_: any, __: any, index: number) => (
        <span style={{ color: '#8c8c8c', fontSize: 13 }}>{index + 1}</span>
      ),
    },
    {
      key: 'name',
      title: 'Tên công việc',
      dataIndex: 'name',
      width: 220,
      fixed: 'left' as const,
      render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      key: 'type',
      title: 'Loại',
      dataIndex: 'type',
      width: 70,
      fixed: 'left' as const,
      render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      key: 'assignees',
      title: 'Người thực hiện',
      dataIndex: 'assignees',
      width: 160,
      render: (assignees: any[]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {assignees?.length > 0 ? (
            assignees.slice(0, 3).map((assignee, index) => {
              const userName = assignee.user?.name || AVATAR_PLACEHOLDER;
              const initials = getInitials(userName);
              const avatarColor = getColorFromName(userName);

              return (
                <Tooltip key={index} title={assignee.user.name}>
                  <Avatar
                    size="small"
                    src={assignee.user.avatar}
                    style={{
                      backgroundColor: avatarColor,
                      color: '#fff',
                      fontWeight: 'bold',
                      marginLeft: index > 0 ? -8 : 0,
                    }}
                  >
                    {initials}
                  </Avatar>
                </Tooltip>
              );
            })
          ) : (
            <Tooltip title="Chưa có người thực hiện">
              <Avatar size="small" style={{ backgroundColor: '#f5f5f5', color: '#8c8c8c' }}>
                <UserOutlined />
              </Avatar>
            </Tooltip>
          )}
          {assignees?.length > 3 && (
            <Avatar
              size="small"
              style={{ backgroundColor: '#f5f5f5', color: '#999', marginLeft: -8 }}
            >
              +{assignees.length - 3}
            </Avatar>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      title: 'Ưu tiên',
      dataIndex: 'priority',
      width: 150,
      render: (priority: ActivityPriority) => (
        <Tag
          color={getActivityPriorityColor(priority)}
          icon={<FlagOutlined style={{ fontSize: 15 }} />}
          className="priority-tag"
          bordered={false}
        >
          {getActivityPriorityLabel(priority) || 'None'}
        </Tag>
      ),
    },
    {
      key: 'estimateTime',
      title: 'Ước tính thời gian',
      dataIndex: 'estimateTime',
      width: 100,
      render: (time: number) => (time ? <span style={{ fontSize: 13 }}>{time} giờ</span> : '-'),
    },
    {
      key: 'startTime',
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      width: 160,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13, display: 'block' }}>
              {new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            <span style={{ fontSize: 13, display: 'block' }}>
              {new Date(date).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'endTime',
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      width: 160,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13, display: 'block' }}>
              {new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
            <span style={{ fontSize: 13, display: 'block' }}>
              {new Date(date).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13 }}>
              {new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>
        ) : (
          '-'
        ),
    },
    {
      key: 'createdBy',
      title: 'Người tạo',
      dataIndex: 'createdBy',
      width: 120,
      render: (createdUserId: string) => {
        const user = users.find(u => u.id === createdUserId);
        return <div style={{ fontWeight: 500 }}>{user ? user.name : 'Không xác định'}</div>;
      },
    },
  ];

  const defaultColumn = ['stt', 'name', 'assignees', 'stageId', 'priority', 'endTime'];
  const { value: visibleColumns, setValue: setVisibleColumns } = useLocalStorageState(
    'litView-visibleColumns',
    defaultColumn,
  );

  const tbColumns = getColumns().filter(col => visibleColumns.includes(col.key));

  const menu = (
    <div style={{ padding: 8 }}>
      <Checkbox.Group
        value={visibleColumns}
        onChange={(checked: any) => setVisibleColumns(checked)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {getColumns().map(col => (
            <Checkbox
              key={col.key}
              value={col.key}
              disabled={col.key === 'name' || col.key === 'stt'}
            >
              {col.title}
            </Checkbox>
          ))}
        </div>
      </Checkbox.Group>
    </div>
  );

  const renderStatusPanel = (status: StageGroup, tasks: IActivity[]) => {
    const config = statusConfig[status];
    if (!config) return null;

    return (
      <Panel
        header={
          <Space
            size="small"
            style={{
              flex: 1,
              gap: 4,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                backgroundColor: config.bgColor,
                padding: '4px 8px 4px 6px',
                borderRadius: '6px',
              }}
            >
              <ColorPicker value={config.bgColor} size={8} disabled />
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: '13px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {config.label}
              </Text>
            </div>
            <div
              style={{
                minWidth: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ecececff',
                color: '#353636ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {config.count}
            </div>
            <Tooltip title="Thêm nhiệm vụ">
              <Button
                type="text"
                style={{
                  marginLeft: 4,
                }}
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  openModal('ModalAddActivity', {
                    stageId: stages.find(s => s.title === config.label)?.id,
                  });
                }}
                icon={<IconPlus size={14} color="#838383" />}
              />
            </Tooltip>
          </Space>
        }
        key={status}
        className="mb-4"
      >
        <div>
          <Table
            style={{
              border: '1px solid #f0f0f0',
              padding: 0,
            }}
            className="ant-table-striped table-view"
            columns={tbColumns}
            dataSource={tasks || []}
            rowKey="id"
            scroll={{ x: 1200 }}
            tableLayout="fixed"
            pagination={false}
            onRow={record => {
              return {
                onClick: () => {
                  openModal('ModalEditActivity', { activity: record });
                },
              };
            }}
          />
          {tasks && tasks.length > 0 && (
            <div className="px-6 py-3 bg-white border-t border-gray-100"></div>
          )}
        </div>
      </Panel>
    );
  };

  return (
    <div className="max-w-full mx-auto bg-gray-50 min-h-screen">
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Dropdown
          overlayClassName="dropdown-menu-overlay"
          overlay={menu}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button icon={<AppstoreAddOutlined />}>Cột hiển thị</Button>
        </Dropdown>
      </div>
      <div className="p-6">
        <Collapse
          activeKey={activeKeys}
          onChange={setActiveKeys}
          expandIcon={({ isActive }) => (
            <IconChevronRight
              size={16}
              style={{
                transition: 'transform 0.2s',
                transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                color: '#8c8c8c',
              }}
            />
          )}
          className="bg-transparent"
          style={{
            border: 'none',
            backgroundColor: 'transparent',
          }}
          ghost
        >
          {Object.entries(statusConfig).map(([status]) =>
            renderStatusPanel(status as any, groupedTasks[status]),
          )}
        </Collapse>
      </div>
    </div>
  );
};

export default ListView;
