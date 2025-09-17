import { useModal } from '@/hooks/useModal';
import '@/styles/edit-activity.css';
import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout, Modal, Space, Tooltip, Typography } from 'antd';
import { useState } from 'react';

const { Text } = Typography;
const { Header, Sider, Content } = Layout;

const ModalEditActivity = () => {
  const { isOpen, type, closeModal, data } = useModal();
  const isOpenModal = isOpen && type === 'ModalEditActivity';
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);

  return (
    <Modal
      open={isOpenModal}
      onCancel={closeModal}
      width="95vw"
      closeIcon={false}
      destroyOnHidden
      centered
      className="modal-edit-activity"
    >
      <Layout className="modal-edit-activity-layout">
        {/* Header */}
        <Header className="modal-edit-activity-header">
          <Space align="center">
            <Tooltip title={collapsedLeft ? 'Mở sidebar trái' : 'Ẩn sidebar trái'}>
              <Button
                type="text"
                icon={collapsedLeft ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsedLeft(!collapsedLeft)}
              />
            </Tooltip>
            <Text type="secondary" className="modal-edit-activity-date-text">
              Ngày tạo
            </Text>
          </Space>

          <Space>
            <Button className="modal-edit-activity-share-button">Chia sẻ</Button>
            <Tooltip title="Đóng">
              <Button type="text" icon={<CloseOutlined />} onClick={closeModal} />
            </Tooltip>
          </Space>
        </Header>

        <Layout className="modal-edit-activity-main-layout">
          {/* Left Sidebar */}
          <Sider
            collapsed={collapsedLeft}
            collapsible
            trigger={null}
            width={200}
            collapsedWidth={0}
            className="modal-edit-activity-left-sider"
          ></Sider>

          {/* Main Content */}
          <Content className="modal-edit-activity-content">
            <div className="modal-edit-activity-content-padding">Content</div>
          </Content>

          {/* Right Sidebar*/}
          <Sider
            collapsed={collapsedRight}
            collapsible
            trigger={null}
            width={300}
            collapsedWidth={40}
            className="modal-edit-activity-right-sider"
          >
            <div
              className={`modal-edit-activity-right-sider-toggle ${
                !collapsedRight ? 'with-border' : ''
              }`}
            >
              <Tooltip title={collapsedRight ? 'Mở sidebar phải' : 'Ẩn sidebar phải'}>
                <Button
                  type="text"
                  icon={collapsedRight ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsedRight(!collapsedRight)}
                />
              </Tooltip>
            </div>
          </Sider>
        </Layout>
      </Layout>
    </Modal>
  );
};

export default ModalEditActivity;
