import {
  Card,
  Typography,
  Descriptions,
  Avatar,
  Tag,
  Space,
  Button,
  Divider,
  Row,
  Col,
  List,
  Result,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { IUser } from '@/common/types';
import { useParams, useNavigate } from 'react-router-dom';
import { useOne, useCan, useGetIdentity } from '@refinedev/core';
import { userRoleFilterOptions } from '@/constants/user';
import { UserInfoSkeleton } from './components/UserInfoSkeleton';
import {
  getAssigneeRoleLabel,
  getAssigneeRoleColor,
  getAssignmentStatusLabel,
  getAssignmentStatusColor,
  getActivityStatusLabel,
  getActivityStatusColor,
  getActivityPriorityLabel,
  getActivityPriorityColor,
  getActivityTypeLabel,
  getActivityCategoryLabel,
  getUserRoleColor,
  getUserStatusColor,
  getUserStatusLabel,
} from '@/utils';

const { Title } = Typography;

export const UserShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity();

  const { data, isLoading } = useOne<IUser>({
    resource: 'users',
    id: id || '',
  });

  const user = data?.data;

  const { data: canEdit } = useCan({
    resource: 'users',
    action: 'edit',
    params: { id: user?.id, identity },
  });

  if (isLoading) {
    return <UserInfoSkeleton />;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '50px 0' }}>
        <Result
          status="404"
          title="Không tìm thấy người dùng"
          subTitle="Người dùng này có thể đã bị xóa hoặc không tồn tại trong hệ thống."
          extra={
            <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  // Helper function to get role label from constants
  const getRoleLabel = (role: string) => {
    const roleOption = userRoleFilterOptions.find(option => option.value === role);
    return roleOption ? roleOption.text : role;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header Actions */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
          Quay lại danh sách
        </Button>
        {canEdit?.can && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/edit/${user.id}`)}
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              textAlign: 'center',
              height: '100%',
              background: '#fafafa',
              borderRadius: 8,
            }}
            styles={{ body: { padding: '32px 24px' } }}
          >
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                marginBottom: 24,
                backgroundColor: '#1890ff',
                fontSize: 48,
              }}
            />
            <Title level={3} style={{ marginBottom: 16, color: '#262626' }}>
              {user.name}
            </Title>

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Tag
                color={getUserRoleColor(user.role)}
                style={{
                  fontSize: 14,
                  padding: '6px 12px',
                  fontWeight: 500,
                  borderRadius: 6,
                }}
              >
                {getRoleLabel(user.role)}
              </Tag>

              <Tag
                color={getUserStatusColor(user.isActive)}
                style={{
                  fontSize: 14,
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                {getUserStatusLabel(user.isActive)}
              </Tag>
            </Space>
          </Card>
        </Col>

        {/* Details Card */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Thông tin chi tiết
              </div>
            }
            style={{ height: '100%', borderRadius: 8 }}
            styles={{ body: { padding: '24px 32px' } }}
          >
            <Descriptions
              column={1}
              labelStyle={{ fontWeight: 600, width: 180, color: '#666' }}
              contentStyle={{ fontSize: 16 }}
              size="middle"
            >
              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    Họ và tên
                  </Space>
                }
              >
                <span style={{ fontWeight: 500 }}>{user.name}</span>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined style={{ color: '#52c41a' }} />
                    Email
                  </Space>
                }
              >
                <a
                  href={`mailto:${user.email}`}
                  style={{
                    fontSize: 16,
                    textDecoration: 'none',
                    color: '#1890ff',
                    fontWeight: 500,
                  }}
                >
                  {user.email}
                </a>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined style={{ color: '#fa8c16' }} />
                    Số điện thoại
                  </Space>
                }
              >
                <a
                  href={`tel:${user.phone}`}
                  style={{
                    fontSize: 16,
                    textDecoration: 'none',
                    color: '#1890ff',
                    fontWeight: 500,
                  }}
                >
                  {user.phone}
                </a>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '32px 0' }} />

            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 16, color: '#333' }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Thông tin thời gian
              </Title>

              <Descriptions
                column={1}
                labelStyle={{ fontWeight: 600, width: 180, color: '#666' }}
                contentStyle={{ fontSize: 16 }}
                size="middle"
              >
                <Descriptions.Item label="Ngày tạo">
                  <span style={{ fontWeight: 500, color: '#333' }}>
                    {new Date(user.createdAt).toLocaleString('vi-VN')}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Cập nhật lần cuối">
                  <span style={{ fontWeight: 500, color: '#333' }}>
                    {new Date(user.updatedAt).toLocaleString('vi-VN')}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Activities Section */}
      {user.assignedActivities && user.assignedActivities.length > 0 && (
        <Card
          title={
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              <ProjectOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Hoạt động được phân công ({user.assignedActivities.length})
            </div>
          }
          style={{ marginTop: 24, borderRadius: 8 }}
        >
          <List
            dataSource={user.assignedActivities}
            renderItem={assignee => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 16 }}>
                            {assignee.activity?.name || 'Không có tên hoạt động'}
                          </span>
                        </div>

                        <div style={{ marginBottom: 8 }}>
                          <Space wrap>
                            {assignee.activity?.type && (
                              <Tag color="blue" style={{ fontSize: 12 }}>
                                {getActivityTypeLabel(assignee.activity.type)}
                              </Tag>
                            )}
                            {assignee.activity?.category && (
                              <Tag color="cyan" style={{ fontSize: 12 }}>
                                {getActivityCategoryLabel(assignee.activity.category)}
                              </Tag>
                            )}
                            {assignee.activity?.priority && (
                              <Tag
                                color={getActivityPriorityColor(assignee.activity.priority)}
                                style={{ fontSize: 12 }}
                              >
                                {getActivityPriorityLabel(assignee.activity.priority)}
                              </Tag>
                            )}
                            {assignee.activity?.mandatory && (
                              <Tag color="orange" style={{ fontSize: 12 }}>
                                Bắt buộc
                              </Tag>
                            )}
                          </Space>
                        </div>

                        {assignee.activity?.description && (
                          <div style={{ marginBottom: 8, color: '#666', fontSize: 14 }}>
                            {assignee.activity.description}
                          </div>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 16,
                            fontSize: 14,
                            color: '#666',
                          }}
                        >
                          {assignee.activity?.startTime && (
                            <span>
                              📅 {new Date(assignee.activity.startTime).toLocaleString('vi-VN')}
                            </span>
                          )}
                          {assignee.activity?.location && (
                            <span>📍 {assignee.activity.location}</span>
                          )}
                          {assignee.activity?.estimateTime && (
                            <span>⏱️ {assignee.activity.estimateTime} phút</span>
                          )}
                        </div>

                        {assignee.note && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: 8,
                              background: '#f0f2f5',
                              borderRadius: 4,
                              fontSize: 14,
                            }}
                          >
                            <strong>Ghi chú:</strong> {assignee.note}
                          </div>
                        )}
                      </div>

                      <div style={{ marginLeft: 16 }}>
                        <Space direction="vertical" align="end">
                          <Space>
                            <Tag color={getAssigneeRoleColor(assignee.role)}>
                              {getAssigneeRoleLabel(assignee.role)}
                            </Tag>
                            <Tag color={getAssignmentStatusColor(assignee.status)}>
                              {getAssignmentStatusLabel(assignee.status)}
                            </Tag>
                          </Space>

                          {assignee.activity?.status && (
                            <Tag color={getActivityStatusColor(assignee.activity.status)}>
                              {getActivityStatusLabel(assignee.activity.status)}
                            </Tag>
                          )}

                          {assignee.assignedAt && (
                            <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>
                              Phân công: {new Date(assignee.assignedAt).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};
