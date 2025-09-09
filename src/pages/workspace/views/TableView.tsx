import { ActivityPriority } from '@/common/enum/activity';
import { IActivity, IStage } from '@/common/types';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { AVATAR_PLACEHOLDER } from '@/constants/app';
import { getActivityPriorityColor, getColorFromName, getInitials } from '@/utils/activity';
import { CalendarOutlined, FlagOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { arrayMoveImmutable } from 'array-move';
import { useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const { Text } = Typography;

interface TableViewProps {
  stages: IStage[];
  activities: IActivity[];
}

//Drag drop icon
const DragHandle = SortableHandle(() => <span className="drag-handle">⋮⋮</span>);

const TableView = ({ stages, activities }: TableViewProps) => {
  const [dataSource, setDataSource] = useState<IActivity[]>(activities);

  const tableColumns = [
    {
      title: 'STT',
      dataIndex: 'id',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DragHandle />
          <span style={{ color: '#8c8c8c', fontSize: 13 }}>{index + 1}</span>
        </div>
      ),
    },
    {
      title: 'Task',
      dataIndex: 'name',
      width: 350,
      render: (text: string) => <div style={{ fontWeight: 500 }}>{text}</div>,
    },
    {
      title: 'Assignee',
      dataIndex: 'assignees',
      width: 160,
      render: (assignees: any[]) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {assignees?.length > 0 ? (
            assignees.slice(0, 3).map((assignee, index) => (
              <Tooltip key={index} title={assignee.user.name}>
                {assignee.user.avatar ? (
                  <Avatar
                    size="small"
                    src={assignee.user.avatar}
                    style={{ marginLeft: index > 0 ? -8 : 0 }}
                  />
                ) : (
                  <Avatar
                    size="small"
                    style={{
                      backgroundColor: getColorFromName(assignee.user.name || AVATAR_PLACEHOLDER),
                      color: '#fff',
                      fontWeight: 'bold',
                      marginLeft: index > 0 ? -8 : 0,
                    }}
                  >
                    {getInitials(assignee.user.name)}
                  </Avatar>
                )}
              </Tooltip>
            ))
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
      title: 'Status',
      dataIndex: 'stageId',
      width: 160,
      render: (stageId: string) => {
        const stage = stages.find(s => s.id === stageId);
        return (
          <Space size="small">
            <div
              style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: stage?.color || '#f5f5f5',
              }}
            >
              <ColorPicker value={stage?.color || ''} />
              <Text style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                {stage?.title || ''}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 160,
      render: (priority: ActivityPriority) => (
        <Tag
          color={getActivityPriorityColor(priority)}
          icon={<FlagOutlined style={{ fontSize: 15 }} />}
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: 13,
          }}
          bordered={false}
        >
          {priority || 'None'}
        </Tag>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      width: 150,
      render: (date: string) =>
        date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
            <span style={{ fontSize: 13 }}>{new Date(date).toLocaleDateString()}</span>
          </div>
        ) : (
          '-'
        ),
    },
  ];

  //Drag & drop
  const SortableItem = SortableElement((props: any) => <tr {...props} />);
  const SortableBody = SortableContainer((props: any) => <tbody {...props} />);

  const DraggableContainer = (props: any) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={({ oldIndex, newIndex }) => {
        if (oldIndex !== newIndex) {
          const newData = arrayMoveImmutable([...dataSource], oldIndex, newIndex);
          setDataSource(newData);
        }
      }}
      {...props}
    />
  );

  const DraggableBodyRow = ({ className, style, ...restProps }: any) => {
    const index = dataSource.findIndex(x => x.id === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <Table
      columns={tableColumns}
      dataSource={dataSource}
      rowKey="id"
      tableLayout="fixed"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
      pagination={false}
    />
  );
};

export default TableView;
