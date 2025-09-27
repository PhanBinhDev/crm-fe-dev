import { IconPointFilled } from '@tabler/icons-react';
import { Avatar, List, Space, Typography } from 'antd';
const { Text, Paragraph } = Typography;

interface ActivityLinksProps {
  activityId: string;
  viewMode: 'list' | 'category';
}

const ActivityLinks = ({ activityId, viewMode }: ActivityLinksProps) => {
  if (viewMode === 'list') {
    return (
      <div>
        <List
          size="small"
          bordered={false}
          //   dataSource={dataLinks.data}
          renderItem={item => (
            <List.Item
              style={{
                border: 'none',
                display: 'flex',
                gap: 4,
                alignItems: 'flex-start',
                color: '#666666ff',
                margin: '5px 10px 0 0',
                padding: ' 0 10px',
              }}
            >
              <div>
                <IconPointFilled size={10} color="#666666ff" />
              </div>
              <div style={{ width: '100%' }}>
                <a
                  //   href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#1677ff' }}
                >
                  {/* {item.fileName} */}
                </a>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
      <a
        style={{
          background: '#9d1111ff',
          border: '1px solid #eaeaea',
          borderRadius: 8,
          padding: 10,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Space
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            width: '60%',
          }}
        >
          <Text strong={true}>Title</Text>
          <Paragraph>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quod cupiditate dolores ab
            reiciendis aliquid vitae, molestias, rerum, doloribus accusamus iste velit quis. Facilis
            quibusdam exercitationem enim dicta ab impedit nemo.
          </Paragraph>
        </Space>
        <Space>
          <Avatar src="https://picsum.photos/id/1/200/300" shape="square" size={130}></Avatar>
        </Space>
      </a>
    </div>
  );
};

export default ActivityLinks;
