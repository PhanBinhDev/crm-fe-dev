import { ActivityType } from '@/common/enum/activity';
import { IActivity } from '@/common/types';
import { SelectedActivityItem } from '@/components/modals/ModalEditActivity';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import '@/styles/overwrite/antd/collapse.css';
import { useCreate } from '@refinedev/core';
import {
  IconCheck,
  IconDeviceFloppy,
  IconDotsVertical,
  IconJumpRope,
  IconPlus,
} from '@tabler/icons-react';
import { Button, Collapse, Input, List, message, Tooltip, Typography } from 'antd';
import { CollapseProps } from 'antd/lib';
import { useMemo, useState } from 'react';
import ActivityDetailCollapseStatus from './ActivityDetailCollapseStatus';

const { Text } = Typography;

interface ActivityDetailSidebarProps {
  activity: IActivity;
  selectedItem: SelectedActivityItem | null;
  loading: boolean;
  onSelectItem: (item: SelectedActivityItem) => void;
  refetchActivity: any;
}

const ActivityDetailSidebar = ({
  activity,
  selectedItem,
  onSelectItem,
  refetchActivity,
}: ActivityDetailSidebarProps) => {
  const [showInput, setShowInput] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const subActivities = activity.subActivities || [];

  const { currentWorkspace } = useWorkspaces();

  const { mutate: createActivity, isPending: isCreating } = useCreate<IActivity>({
    resource: 'activities',
  });

  const handleCreateActivity = async () => {
    setError(false);

    if (!name || name.trim() === '') {
      setError(true);
      return;
    }

    createActivity(
      {
        values: {
          parentId: activity.id,
          name,
          workspaceId: currentWorkspace?.id,
          stageId: activity.stage.id,
          type: ActivityType.TASK,
        },
      },
      {
        onSuccess: ({ data }) => {
          message.success('Tạo hoạt động phụ thành công');
          setShowInput(false);
          setName('');
          onSelectItem({ type: 'subactivity', data });
          refetchActivity();
        },
        onError: error => {
          message.error(error.message || 'Tạo hoạt động phụ thất bại');
        },
      },
    );
  };

  const isActivitySelected = useMemo(() => {
    return selectedItem?.type === 'activity' && selectedItem?.data?.id === activity.id;
  }, [selectedItem, activity.id]);

  const items: CollapseProps['items'] = [
    {
      key: 'activity',
      className: 'custom-collapse',
      headerClass: `custom-collapse-header ${isActivitySelected ? 'active' : ''}`,
      onClick: () => {
        onSelectItem({ type: 'activity', data: activity });
      },
      onMouseEnter: e => {
        if (e.currentTarget === e.target) setHovered(activity.id);
      },
      onMouseLeave: e => {
        if (e.currentTarget === e.target) setHovered(null);
      },
      label: (
        <div
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '200px',
            overflow: 'hidden',
          }}
        >
          <Tooltip placement="top" title={activity.name}>
            {activity.name}
          </Tooltip>

          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: 12,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hovered === activity.id ? (
              <IconDotsVertical size={14} color="#838383" />
            ) : isActivitySelected ? (
              <IconCheck size={14} color="#838383" />
            ) : null}
          </div>
        </div>
      ),
      style: {
        background: '#fff',
        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
        borderRadius: 6,
        padding: '6px 8px',
        height: '100%',
      },
      children: (
        <div
          style={{
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <List
            style={{
              marginLeft: 12,
            }}
            dataSource={[
              ...subActivities,
              ...(showInput
                ? [
                    {
                      id: 'new',
                      name: (
                        <Input
                          variant="borderless"
                          style={{
                            padding: 0,
                            borderRadius: 0,
                            flex: 1,
                            width: '100%',
                            minWidth: 0,
                          }}
                          placeholder="Nhập tên hoạt động phụ"
                          autoFocus
                          disabled={isCreating}
                          value={name}
                          onChange={e => {
                            setName(e.target.value);
                            if (error) setError(false);
                          }}
                          onBlur={() => {
                            setShowInput(false);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleCreateActivity();
                            }
                          }}
                        />
                      ),
                      stage: { id: '', title: '', position: 0, color: '#d9d9d9' },
                    } as unknown as IActivity,
                  ]
                : []),
            ]}
            renderItem={(item: IActivity) => {
              const isSelected =
                selectedItem?.type === 'subactivity' && selectedItem?.data?.id === item.id;

              return (
                <List.Item
                  key={item.id}
                  onClick={e => {
                    e.stopPropagation();
                    if (item.id === 'new') return;
                    onSelectItem({
                      type: 'subactivity',
                      data: item as IActivity,
                    });
                  }}
                  style={{
                    padding: '6px 8px 6px 12px',
                    border: 0,
                    borderRadius: 6,
                    margin: 1,
                    gap: 12,
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundColor: isSelected ? '#f2f2f2' : 'transparent',
                    maxHeight: 34,
                  }}
                  onMouseEnter={e => {
                    e.stopPropagation();
                    if (!isSelected)
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
                    if (e.currentTarget === e.target) setHovered(item.id);
                  }}
                  onMouseLeave={e => {
                    e.stopPropagation();
                    if (!isSelected)
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    if (e.currentTarget === e.target) setHovered(null);
                  }}
                >
                  <ActivityDetailCollapseStatus color={item?.stage?.color} />
                  <Text
                    style={{
                      width: '100%',
                    }}
                  >
                    {item.name}
                  </Text>

                  {item.id === 'new' ? (
                    <Button
                      size="small"
                      type="text"
                      style={{
                        borderRadius: 6,
                        padding: '0 6px',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        handleCreateActivity();
                      }}
                      loading={isCreating}
                      icon={<IconDeviceFloppy size={16} color="#838383" />}
                      styles={{
                        icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
                      }}
                    />
                  ) : hovered === item.id ? (
                    <IconDotsVertical size={16} color="#838383" />
                  ) : isSelected ? (
                    <IconCheck size={16} color="#838383" />
                  ) : null}
                </List.Item>
              );
            }}
          />
          <Button
            type="text"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '0 10px',
              borderRadius: 6,
            }}
            onClick={() => setShowInput(true)}
            icon={<IconPlus size={14} color="#838383" />}
          >
            Thêm hoạt động phụ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 8px 12px 16px',
          borderBottom: '1px solid #f0f0f0',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconJumpRope size={14} color="#888" />
          <Text style={{ fontWeight: 600, color: '#818181' }}>Hoạt động phụ</Text>
        </div>

        <span
          style={{
            fontSize: 12,
            color: '#888',
            background: '#f5f5f5',
            borderRadius: 12,
            padding: '2px 10px',
            fontWeight: 500,
          }}
        >
          {'Open'}
        </span>
      </div>
      <div
        style={{
          padding: 6,
          flex: 1,
        }}
      >
        <Collapse
          activeKey={['activity']}
          bordered={false}
          collapsible={'header'}
          size="small"
          style={{
            height: '100%',
          }}
          expandIcon={() => <ActivityDetailCollapseStatus color={activity?.stage?.color} />}
          items={items}
        />
      </div>
    </div>
  );
};

export default ActivityDetailSidebar;
