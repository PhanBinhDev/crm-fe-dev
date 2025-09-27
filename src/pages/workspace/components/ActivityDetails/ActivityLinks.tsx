import { IconPointFilled } from '@tabler/icons-react';
import { Avatar, Card, List, Typography } from 'antd';
const { Text, Paragraph } = Typography;

interface ActivityLinksProps {
  activityId: string;
  viewMode: 'list' | 'category';
}

const ActivityLinks = ({ activityId, viewMode }: ActivityLinksProps) => {
  if (viewMode === 'list') {
    return (
      <div style={{ padding: 8, maxHeight: 'calc(90vh - 97px)', overflowY: 'auto' }}>
        <List
          size="small"
          dataSource={[{ title: 'Google', url: 'https://google.com' }]}
          renderItem={item => (
            <List.Item
              style={{
                border: 'none',
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <IconPointFilled size={8} color="#888" />
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, color: '#1677ff', marginLeft: 4 }}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod cupiditate dolores...
              </a>
            </List.Item>
          )}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 8,
        maxHeight: 'calc(90vh - 97px)',
        overflowY: 'auto',
      }}
    >
      <Card
        hoverable
        style={{ borderRadius: 12, boxShadow: '0 3px 3px rgba(0, 0, 0, 0.1)' }}
        bodyStyle={{ display: 'flex', gap: 16, padding: 12 }}
      >
        <div style={{ flex: 1, maxHeight: 100, overflow: 'hidden' }}>
          <p style={{ fontSize: 11, color: '#909090ff', marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 600, marginRight: 5 }}>vtdiem</span>10/10/1000
            00:00
          </p>
          <Paragraph
            strong
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 5, fontSize: 13, lineHeight: 1.2 }}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod cupiditate dolores...
          </Paragraph>
          <Paragraph
            ellipsis={{ rows: 2, expandable: false }}
            style={{ fontSize: 12, marginBottom: 0 }}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod cupiditate dolores...
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod cupiditate dolores...
          </Paragraph>
        </div>
        <Avatar
          src="https://picsum.photos/id/1/200/300"
          shape="square"
          size={100}
          style={{ borderRadius: 8 }}
        />
      </Card>
    </div>
  );
};

export default ActivityLinks;
