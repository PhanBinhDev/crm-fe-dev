import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export const DashboardPage: React.FC = () => {
  // Fetch dashboard stats
  // const { data: statsData } = useCustom({
  //   url: `${apiUrl}/dashboard/stats`,
  //   method: 'get',
  // });

  const stats = {
    totalCustomers: 100,
    activeLeads: 50,
    opportunities: 30,
    monthlyRevenue: 2000000,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers || 0}
              prefix={<UserOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  <span style={{ color: '#3f8600' }}>12%</span>
                </Space>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Leads hoạt động"
              value={stats.activeLeads || 0}
              prefix={<TeamOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  <span style={{ color: '#3f8600' }}>8%</span>
                </Space>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cơ hội"
              value={stats.opportunities || 0}
              prefix={<ShoppingCartOutlined />}
              suffix={
                <Space>
                  <ArrowDownOutlined style={{ color: '#cf1322' }} />
                  <span style={{ color: '#cf1322' }}>3%</span>
                </Space>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng"
              value={stats.monthlyRevenue || 0}
              prefix={<DollarOutlined />}
              precision={0}
              suffix="VNĐ"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Hoạt động gần đây">{/* Recent activities component */}</Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Nhiệm vụ hôm nay">{/* Today's tasks component */}</Card>
        </Col>
      </Row>
    </div>
  );
};
