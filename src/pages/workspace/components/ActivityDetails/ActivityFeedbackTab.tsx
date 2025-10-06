import { IconFilter2 } from '@tabler/icons-react';
import { Button, Checkbox, Popover, Radio, Space, Typography } from 'antd';
import { useState } from 'react';
import ActivityFeedbacks from './ActivityFeedbacks';

interface ActivityFeedbackTabProps {
  activityId: string;
}

const ActivityFeedbackTab = ({ activityId }: ActivityFeedbackTabProps) => {
  const [filters, setFilters] = useState({
    type: 'all', // all, feedback, rating
    rating: [], // 1,2,3,4,5
    hasComment: false,
  });

  const FilterContent = () => (
    <div style={{ width: 240 }}>
      <Typography.Text
        strong
        style={{ display: 'block', padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}
      >
        Lọc đánh giá và phản hồi
      </Typography.Text>

      <div style={{ padding: '8px 12px' }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Loại
        </Typography.Text>
        <Radio.Group
          value={filters.type}
          onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
        >
          <Radio value="all">Tất cả</Radio>
          <Radio value="rating">Chỉ đánh giá</Radio>
          <Radio value="feedback">Chỉ phản hồi</Radio>
        </Radio.Group>
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Số sao
        </Typography.Text>
        <Checkbox.Group
          value={filters.rating}
          onChange={values => setFilters(prev => ({ ...prev, rating: values }))}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
        >
          <Checkbox value={5}>5 sao</Checkbox>
          <Checkbox value={4}>4 sao</Checkbox>
          <Checkbox value={3}>3 sao</Checkbox>
          <Checkbox value={2}>2 sao</Checkbox>
          <Checkbox value={1}>1 sao</Checkbox>
        </Checkbox.Group>
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
        <Checkbox
          checked={filters.hasComment}
          onChange={e => setFilters(prev => ({ ...prev, hasComment: e.target.checked }))}
        >
          Chỉ hiển thị có bình luận
        </Checkbox>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 8px 8px 16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'relative',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Đánh giá và Phản hồi
        </Typography.Title>
        <Space style={{ gap: 0 }}>
          <Popover
            placement="bottomRight"
            content={FilterContent}
            trigger={['click']}
            arrow={false}
            styles={{
              body: {
                padding: 0,
              },
            }}
          >
            <Button
              styles={{
                icon: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              }}
              type="text"
              icon={<IconFilter2 size={16} stroke={1.5} color="#646464" />}
              style={{ borderRadius: 8 }}
            />
          </Popover>
        </Space>
      </div>
      <div style={{ background: '#f7f7f7ff', height: '100%', width: '100%' }}>
        <ActivityFeedbacks activityId={activityId} />
      </div>
    </div>
  );
};

export default ActivityFeedbackTab;
