import { getUsername } from '@/utils/formatter';
import { IconBell, IconBellOff, IconCheck } from '@tabler/icons-react';
import { Avatar, Button, Divider, Input, Popover, Space } from 'antd';
import { useState } from 'react';

const mockedFollowers = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', avatar: '' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', avatar: '' },
  { id: '3', name: 'Alice Johnson', email: 'alice.johnson@example.com', avatar: '' },
];

interface IFollower {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const ActivityDetailFollowLog = () => {
  const [showFilter, setShowFilter] = useState(false);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);

    // call API to update follow status
    console.log('Toggle follow status:', !isFollowing);
  };

  const renderFollowerAvatar = (follower: IFollower, size: number = 24) => {
    if (follower?.avatar && typeof follower.avatar === 'string') {
      const avatarUrl = follower.avatar.startsWith('http')
        ? follower.avatar
        : `${import.meta.env.VITE_API_BASE_URL}${follower.avatar}`;

      return <Avatar size={size} src={avatarUrl} />;
    }

    return (
      <div
        style={{
          padding: 2,
          borderRadius: '50%',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Avatar
          size={size}
          style={{
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'oklch(27.4% 0.006 286.033)',
          }}
        >
          {getUsername(follower.name)}
        </Avatar>
      </div>
    );
  };

  const contentFilter = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
      }}
    >
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <Space
          direction="vertical"
          style={{
            gap: 0,
            padding: '8px',
            paddingBottom: '0px',
            width: '100%',
          }}
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Button
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '0 6px',
              alignItems: 'center',
            }}
            type="text"
            size="middle"
            onClick={toggleFollow}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isFollowing ? (
                <>
                  <IconBell size={14} color="#838383" />
                  Theo dõi
                </>
              ) : (
                <>
                  <IconBellOff size={14} color="#838383" />
                  Bỏ theo dõi
                </>
              )}
            </div>
            {true && <IconCheck size={14} color="#838383" />}
          </Button>
        </Space>

        <Divider
          size="small"
          style={{
            margin: 0,
          }}
        />

        <Space
          direction="vertical"
          style={{
            gap: 8,
            padding: '8px',
            width: '100%',
          }}
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Input placeholder="Tìm kiếm..." />
          <span
            style={{
              color: '#838383',
              marginLeft: 8,
            }}
          >
            {mockedFollowers.length} Theo dõi
          </span>
          {mockedFollowers.map(follower => (
            <Button
              key={follower.id}
              type="text"
              style={{
                padding: '20px 4px',
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              {renderFollowerAvatar(follower, 30)}
              <div
                style={{
                  display: 'flex',
                  textAlign: 'left',
                }}
              >
                {follower.name}
              </div>
            </Button>
          ))}
        </Space>
      </Space>
    </Space>
  );

  return (
    <Popover
      placement="bottomRight"
      arrow={false}
      open={showFilter}
      trigger={['click']}
      onOpenChange={setShowFilter}
      content={contentFilter}
      styles={{
        body: {
          padding: '0',
          width: 250,
        },
      }}
    >
      <Button
        type="text"
        style={{
          borderRadius: 8,
          justifyContent: 'flex-start',
          gap: 4,
          padding: '0 8px',
        }}
      >
        <IconBell size={16} stroke={1.5} color="#646464" />
        <span style={{ fontSize: 14, color: '#646464', fontWeight: 500 }}>4</span>
      </Button>
    </Popover>
  );
};

export default ActivityDetailFollowLog;
