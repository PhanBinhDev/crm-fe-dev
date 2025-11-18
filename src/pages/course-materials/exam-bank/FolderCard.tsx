import { IFolder } from '@/common/types/document';
import { getColorFromName } from '@/utils/activity';
import { IconEdit, IconFolderFilled, IconPointFilled, IconTrash } from '@tabler/icons-react';
import { Button, Card, Col, Dropdown, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

interface FolderCardProps {
  folder: IFolder;
  onNavigate: (id: string) => void;
  onEdit: (folder: any) => void;
  onDelete: (id: string, name: string) => void;
}

const FolderCard = ({ folder, onNavigate, onEdit, onDelete }: FolderCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  console.log('folder', folder);

  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        onClick={() => onNavigate(folder.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          height: '100%',
          // minHeight: 100,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
        bodyStyle={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 10px',
        }}
        hoverable={false}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(99, 102, 241, 0.02))',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
          }}
        />

        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Sửa', icon: <IconEdit size={14} /> },
              { key: 'delete', label: 'Xóa', danger: true, icon: <IconTrash size={14} /> },
            ],
            onClick: info => {
              info.domEvent.stopPropagation();
              const { key } = info;
              if (key === 'edit') {
                onEdit(folder);
              } else if (key === 'delete') {
                onDelete(folder.id, folder.name);
              }
            },
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<span style={{ fontSize: 16, color: 'black', fontWeight: 500 }}>⋮</span>}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              color: '#878787ff',
              opacity: isHovered ? 1 : 0.5,
              transition: 'all 0.2s ease',
              zIndex: 10,
              width: 20,
            }}
          />
        </Dropdown>

        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: getColorFromName(folder.name),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.25)',
              }}
            >
              <IconFolderFilled size={24} color="#fff" />
            </div>
            <p
              style={{
                fontSize: 12,
                opacity: 0.7,
                marginTop: 5,
              }}
            >
              {folder.totalDocuments ? folder.totalDocuments : 0} files
            </p>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography.Text
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isHovered ? '#111827' : '#374151',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color 0.2s ease',
                }}
              >
                {folder.name}
              </Typography.Text>

              <p
                style={{
                  fontSize: 12,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginTop: 3,
                  marginBottom: 0,
                }}
              >
                {folder.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 12,
                opacity: 0.65,
                marginTop: 5,
              }}
            >
              <p style={{ margin: 0, flexShrink: 0 }}>{folder.createdBy?.name}</p>
              <IconPointFilled size={7} color="#999" style={{ margin: '0 3px' }} />
              <p style={{ margin: 0, flexShrink: 0 }}>
                {dayjs(folder.createdAt).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  );
};

export default FolderCard;
