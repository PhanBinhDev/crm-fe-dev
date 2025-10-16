import { IWorkspace } from '@/common/types';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useList } from '@refinedev/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Avatar, Button, Card, Empty, Space, Typography, Spin } from 'antd';

const { Text } = Typography;

const InvitationList = () => {

    const { data, isLoading } = useList<IWorkspace>({
        resource: 'workspaces/invitations',
        pagination: { mode: 'off' },
        queryOptions: {
            retry: false,
        },
    });


    const handleAcceptInvitation = () => {
    };

    const handleRejectInvitation = () => {
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    };

    const workspaces = data?.data || [];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (workspaces.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có lời mời nào"
                style={{ padding: '40px 0' }}
            />
        );
    }

    return (
        <Card
            title={<Text style={{ fontSize: 17 }}>Lời mời tham gia ({workspaces.length})</Text>}
            style={{ marginBottom: 10, padding: 5 }}
            size="small"
        >
            <div style={{ paddingRight: 8, marginBottom: 8 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {workspaces.map(workspace => (
                        <div
                            key={workspace.id}
                            style={{
                                padding: '10px 16px',
                                background: '#fafafa',
                                borderRadius: 8,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 12,
                            }}
                        >
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                {workspace.avatar ? (
                                    <Avatar
                                        src={
                                            workspace?.avatar &&
                                            `${import.meta.env.VITE_API_BASE_URL}${workspace?.avatar}?t=${workspace?.updatedAt}`
                                        }
                                        size={48}
                                        style={{ background: getColorFromName(workspace?.name) }}
                                    >
                                        {getInitials(workspace?.name)}
                                    </Avatar>
                                ) : (
                                    <Avatar size={48} style={{ background: getColorFromName(workspace.name) }}>
                                        {getInitials(workspace.name)}
                                    </Avatar>
                                )}
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: 17 }}>
                                        {workspace.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                        Bạn được mời tham gia • {formatTimeAgo(workspace.createdAt)}
                                    </div>
                                </div>
                            </div>
                            <Space>
                                <Button
                                    size="small"
                                    danger
                                    icon={<IconX size={14} />}
                                    onClick={handleRejectInvitation}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<IconCheck size={14} />}
                                    onClick={handleAcceptInvitation}
                                >
                                    Chấp nhận
                                </Button>
                            </Space>
                        </div>
                    ))}
                </Space>
            </div>
        </Card>
    );
};

export default InvitationList;