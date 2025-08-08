import { IStage } from '@/common/types';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dropdown, MenuProps, Typography } from 'antd';

interface SortableStageItemProps {
  stage: IStage;
  onEdit: (stage: IStage) => void;
  onDelete: (id: string) => void;
  onColorChange?: (id: string, color: string) => void;
}

export const SortableStageItem: React.FC<SortableStageItemProps> = ({
  stage,
  onEdit,
  onDelete,
  onColorChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleColorChange = (color: string) => {
    onColorChange?.(stage.id, color);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'rename',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditOutlined style={{ color: '#595959' }} />
          <span style={{ color: '#262626' }}>Đổi tên</span>
        </div>
      ),
      onClick: () => onEdit(stage),
    },
    {
      key: 'delete',
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="delete-menu-item"
        >
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          <span style={{ color: '#ff4d4f' }}>Xóa trạng thái</span>
        </div>
      ),
      danger: true,
      onClick: () => onDelete(stage.id),
    },
  ];

  return (
    <div
      ref={setNodeRef}
      style={{
        width: '100%',
        marginBottom: '4px',
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: '12px',
        padding: '8px 12px',
        ...style,
      }}
      onMouseEnter={e => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              color: '#8c8c8c',
              fontSize: '12px',
              marginRight: '8px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
            onMouseDown={e => {
              e.currentTarget.style.cursor = 'grabbing';
            }}
            onMouseUp={e => {
              e.currentTarget.style.cursor = 'grab';
            }}
          >
            ⋮⋮
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '8px',
              lineHeight: 1,
            }}
          >
            <ColorPicker value={'#EA580C'} onChange={handleColorChange} size={12} />
          </div>
          <Typography.Text
            style={{
              fontSize: '14px',
              fontWeight: 500,
              marginLeft: '12px',
              flex: 1,
            }}
          >
            {stage.title}
          </Typography.Text>
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayStyle={{
              minWidth: '160px',
            }}
            overlayClassName="custom-dropdown"
          >
            <div
              style={{
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#8c8c8c',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={e => e.stopPropagation()}
            >
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
