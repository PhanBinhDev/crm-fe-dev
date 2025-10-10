import { getUsername } from '@/utils/formatter';
import { useCustomMutation, useList } from '@refinedev/core';
import { IconBell, IconBellOff, IconCheck } from '@tabler/icons-react';
import { Avatar, Button, Divider, Input, Popover, Space, Tooltip } from 'antd';
import { useState } from 'react';

import { IFollower } from '@/common/types/follower';
import { useAuth } from '@/hooks/useAuth';

const ActivityDetailFollowLog = ({ activityId }: { activityId: string }) => {
  const [showFilter, setShowFilter] = useState(false);
  const [usersSelected, setUsersSelected] = useState<string[]>([]);

  const { user, isLoading } = useAuth();
  const { mutate: followActivity } = useCustomMutation();
  const { mutate: unfollowActivity } = useCustomMutation();

  const isCurrentUserFollowing = (followers: IFollower[] | undefined) => {
    if (!user || isLoading || !followers) return false;
    return followers.some(follower => follower.userId === user.id);
  };

  const { data: activityFollowers, refetch } = useList<IFollower>({
    resource: `activities/${activityId}/follows`,
    config: { pagination: { mode: 'off' } },
  });

  const [isFollowing, setIsFollowing] = useState<boolean>(
    isCurrentUserFollowing(activityFollowers?.data),
  );

  console.log('user', user);

  const toggleFollowByCurrentUser = () => {
    setIsFollowing(!isFollowing);
    if (!user) return;
    if (isFollowing) {
      return unfollowActivity(
        {
          url: `activities/${activityId}/follow/batch`,
          method: 'delete',
          values: { userIds: [user?.id] },
        },
        {
          onSuccess: () => {
            console.log('Cập nhật theo dõi thành công');
            refetch();
          },
          onError: () => {
            setIsFollowing(isFollowing);
            console.error('Cập nhật theo dõi thất bại');
          },
        },
      );
    }
    return followActivity(
      {
        url: `activities/${activityId}/follow/batch`,
        method: 'post',
        values: { userIds: [user?.id] },
      },
      {
        onSuccess: () => {
          console.log('Cập nhật theo dõi thành công');
          refetch();
        },
        onError: () => {
          setIsFollowing(isFollowing);
          console.error('Cập nhật theo dõi thất bại');
        },
      },
    );
  };

  const renderFollowerAvatar = (follower: IFollower, size: number = 24) => {
    if (follower?.user?.avatar && typeof follower?.user.avatar === 'string') {
      const avatarUrl = follower?.user.avatar.startsWith('http')
        ? follower?.user.avatar
        : `${import.meta.env.VITE_API_BASE_URL}${follower?.user.avatar}`;

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
          {getUsername(follower?.user.username)}
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
            onClick={toggleFollowByCurrentUser}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {!isFollowing ? (
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
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <span
              style={{
                color: '#838383',
                marginLeft: 8,
              }}
            >
              {activityFollowers?.data.length} Theo dõi
            </span>

            <Tooltip title="Chọn tất cả">('')</Tooltip>
          </Space>
          {activityFollowers?.data?.map(follower => {
            const isSelected = usersSelected.includes(follower.userId);
            return (
              <Button
                key={follower.id}
                type="text"
                style={{
                  padding: '8px 4px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                }}
                onClick={() =>
                  setUsersSelected(prev =>
                    prev.includes(follower.userId)
                      ? prev.filter(id => id !== follower.userId)
                      : [...prev, follower.userId],
                  )
                }
              >
                <Space align="center">
                  {renderFollowerAvatar(follower, 30)}
                  <div style={{ textAlign: 'left' }}>{follower?.user.username}</div>
                </Space>
                {isSelected && <IconCheck size={14} color="blue" />}
              </Button>
            );
          })}
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
