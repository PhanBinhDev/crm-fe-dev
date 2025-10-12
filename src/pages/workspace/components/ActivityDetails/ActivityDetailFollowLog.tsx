import { IMember } from '@/common/types';
import { IFollower } from '@/common/types/follower';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/hooks/useWorkspaces';
import { getInitials } from '@/utils/activity';
import { useCreate, useList } from '@refinedev/core';
import {
  IconBell,
  IconBellFilled,
  IconBellOff,
  IconCheck,
  IconUserPlus,
} from '@tabler/icons-react';
import { Avatar, Button, Divider, Input, List, Popover, Space } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface ActivityDetailFollowLogProps {
  activityId?: string;
}

const ActivityDetailFollowLog = ({ activityId }: ActivityDetailFollowLogProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [isFollowed, setIsFollowed] = useState(false);
  const [followers, setFollowers] = useState<IFollower[]>([]);

  const { currentWorkspace } = useWorkspaceStore();
  const { user, isLoading } = useAuth();

  const {
    data: followersData,
    isLoading: isLoadingFollows,
    refetch: refetchFollows,
  } = useList<IFollower>({
    resource: `activities/${activityId}/follows`,
    queryOptions: {
      enabled: !!activityId,
      retry: false,
    },
  });

  const { data: membersData, isLoading: isLoadingMembers } = useList<IMember>({
    resource: `workspaces/${currentWorkspace?.id}/members`,
    queryOptions: {
      enabled: !!currentWorkspace?.id,
      retry: false,
    },
    filters: [
      {
        field: 'q',
        operator: 'eq',
        value: debouncedSearch,
      },
    ],
  });

  const { mutate: updateFollow } = useCreate<IFollower>({
    mutationOptions: {
      retry: false,
    },
  });

  useEffect(() => {
    if (isLoadingFollows || !followersData) return;

    setFollowers(followersData.data);
  }, [followersData, isLoadingFollows]);

  const members = useMemo(() => {
    if (isLoadingMembers || !membersData) return [];

    return membersData.data.map(member => {
      const isFollow = followers.find(follow => follow.userId === member.user.id);
      return {
        ...member,
        isFollow: !!isFollow,
      };
    });
  }, [membersData, isLoadingMembers, followers]);

  const handleToggleFollows = useCallback(
    (
      member: IMember & {
        isFollow: boolean;
      },
    ) => {
      if (member.isFollow) {
        setFollowers(prev => prev.filter(follow => follow.userId !== member.user.id));

        if (followers.length === 1) {
          setIsFollowed(false);
        }

        updateFollow({
          resource: `activities/${activityId}/unfollow/batch`,
          values: {
            userIds: [member.user.id],
          },
        });

        return;
      }

      const newFollower: IFollower = {
        activityId: activityId!,
        userId: member.user.id,
        user: member.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(2, 15),
        createdBy: user?.id || '',
      };

      setFollowers(prev => [...prev, newFollower]);
      setIsFollowed(true);
      updateFollow({
        resource: `activities/${activityId}/follow/batch`,
        values: {
          userIds: [member.user.id],
        },
      });
    },
    [activityId, updateFollow, user, followers],
  );

  const handleToggle = useCallback(() => {
    if (!isFollowed) {
      setIsFollowed(true);

      const newFollower: IFollower = {
        activityId: activityId!,
        userId: user?.id!,
        user: user!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: Math.random().toString(36).substring(2, 15),
        createdBy: user?.id || '',
      };

      setFollowers(prev => [...prev, newFollower]);
      updateFollow({
        resource: `activities/${activityId}/follow/batch`,
        values: {
          userIds: [user?.id],
        },
      });
    } else {
      setIsFollowed(false);
      setFollowers(prev => prev.filter(follow => follow.userId !== user?.id));
      updateFollow({
        resource: `activities/${activityId}/unfollow/batch`,
        values: {
          userIds: followers.map(follow => follow.userId),
        },
      });
    }
  }, [activityId, followers, updateFollow, setIsFollowed, user]);

  const contentFilter = (
    <Space
      direction="vertical"
      style={{
        width: '100%',
        paddingBottom: 8,
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
            onClick={handleToggle}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {!isFollowed ? (
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
            gap: 4,
            padding: '0px 8px',
            width: '100%',
          }}
          styles={{
            item: {
              width: '100%',
            },
          }}
        >
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {!isLoadingMembers && followers.length > 0 && (
            <span
              style={{
                color: '#838383',
                fontSize: 12,
                lineHeight: '16px',
              }}
            >
              {followers.length} người theo dõi
            </span>
          )}
        </Space>

        <List
          dataSource={members}
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            width: '100%',
            padding: '0 8px',
            minHeight: `${Math.min(members.length * 36, 200)}px`,
          }}
        >
          {isLoadingMembers || isLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                margin: '0 8px',
                borderRadius: 8,
                background: '#f5f5f5',
              }}
            >
              <Spinner size={20} />
            </div>
          ) : members.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '16px 12px',
                fontSize: 13,
                borderRadius: 6,
                background: '#f5f5f5',
              }}
            >
              Không tìm thấy thành viên nào
            </div>
          ) : (
            <>
              {members.map((member, index) => {
                const currentUser = user?.id === member.user.id;
                return (
                  <List.Item
                    key={member.id}
                    style={{
                      padding: '6px 10px',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 6,
                      transition: 'background-color 0.2s ease',
                      marginTop: index !== 0 ? 4 : 0,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                    onClick={() => handleToggleFollows(member)}
                  >
                    <Avatar
                      src={member.user.avatar}
                      size="small"
                      style={{
                        border: '1px solid #1890ff',
                        marginRight: 8,
                      }}
                    >
                      {getInitials(member.user.name)}
                    </Avatar>

                    <span
                      style={{
                        fontSize: 13,
                        color: '#222',
                        fontWeight: 500,
                        flex: 1,
                      }}
                    >
                      {member.user.name}

                      {currentUser && ' (Bạn)'}
                    </span>

                    {member.isFollow && (
                      <IconCheck
                        size={16}
                        color="#838383"
                        style={{ flexShrink: 0, marginLeft: 'auto' }}
                      />
                    )}
                  </List.Item>
                );
              })}
            </>
          )}
        </List>

        <div style={{ padding: '8px 8px 0', borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              height: 30,
              padding: '0 8px',
            }}
            icon={<IconUserPlus size={14} />}
          >
            Mời thành viên
          </Button>
        </div>
      </Space>
    </Space>
  );

  return (
    <Popover
      placement="bottomRight"
      arrow={false}
      trigger={['click']}
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
        loading={isLoadingFollows}
        icon={
          followers.length > 0 ? (
            <IconBellFilled size={16} stroke={1.5} color="#1890ff" />
          ) : (
            <IconBell size={16} stroke={1.5} color="#646464" />
          )
        }
        styles={{
          icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        }}
      >
        {!isLoadingFollows && (
          <span style={{ fontSize: 13, color: '#646464', fontWeight: 500 }}>
            {followers.length}
          </span>
        )}
      </Button>
    </Popover>
  );
};

export default ActivityDetailFollowLog;
