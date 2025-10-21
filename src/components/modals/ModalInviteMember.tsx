import { useModal } from '@/hooks/useModal';
import { IconX } from '@tabler/icons-react';
import { Button, Drawer, Space, Typography } from 'antd';

const ModalInviteMember = () => {
  const { isOpen, type, closeModal } = useModal();

  const isOpenModal = isOpen && type === 'ModalInviteMember';

  return (
    <Drawer
      closeIcon={null}
      open={isOpenModal}
      onClose={closeModal}
      destroyOnHidden
      styles={{
        wrapper: {
          margin: 12,
          borderRadius: 12,
          overflow: 'hidden',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Space
          align="center"
          style={{
            width: '100%',
            padding: '12px 10px 12px 15px',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Title
            level={5}
            style={{
              margin: 0,
            }}
          >
            Mời thành viên
          </Typography.Title>

          <Button
            type="text"
            size="small"
            onClick={closeModal}
            icon={<IconX size="16" />}
            styles={{
              icon: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}
            style={{
              padding: '4px',
              borderRadius: 8,
            }}
          />
        </Space>

        <Space direction="vertical" style={{ padding: '12px 15px', flex: 1 }}>
          hello
        </Space>

        <Space
          style={{
            width: '100%',
            marginTop: 'auto',
            borderTop: '1px solid #f0f0f0',
            padding: '10px 15px',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            style={{
              borderRadius: 8,
              border: '1px solid #d9d9d9',
            }}
            onClick={closeModal}
          >
            Hủy
          </Button>

          <Button
            type="text"
            style={{
              marginLeft: 'auto',
              background: '#1890ff',
              borderRadius: 8,
              color: '#fff',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#40a9ff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1890ff';
            }}
          >
            Tiếp tục
          </Button>
        </Space>
      </div>
    </Drawer>
  );
};

export default ModalInviteMember;
