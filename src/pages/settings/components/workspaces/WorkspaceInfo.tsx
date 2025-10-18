import { MemberRole, WorkspaceVisibility } from '@/common/enum/workspace';
import { IWorkspace } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useList, useOne } from '@refinedev/core';
import { IconTransfer, IconUpload, IconX } from '@tabler/icons-react';
import { Avatar, Button, Card, Form, Input, message, Space, Switch, Tooltip, Upload } from 'antd';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useMediaQuery } from 'usehooks-ts';
interface IWorkspaceInfoProps {
  onFormChange: (isChanged: boolean) => void;
  onUpdate: any;
}

const WorkspaceInfo = forwardRef(({ onFormChange, onUpdate }: IWorkspaceInfoProps, ref) => {
  const { refreshWorkspaces } = useWorkspaces();
  const { user } = useAuth();
  const isTablet = useMediaQuery('(max-width: 991px)');
  const { workspaceId } = useParams();
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const { openModal }: any = useModal();

  useImperativeHandle(ref, () => ({
    submit: () => form.submit(),
    cancel: () => {
      if (workspaceData?.data?.avatar) {
        setAvatarPreview(workspaceData.data.avatar);
      } else {
        setAvatarPreview(undefined);
      }
      setAvatarFile(null);

      form.setFieldsValue({
        name: workspaceData?.data?.name,
        description: workspaceData?.data?.description,
        visibility: workspaceData?.data?.visibility || WorkspaceVisibility.PUBLIC,
        removeAvatar: undefined,
      });

      onFormChange(false);
    },
  }));

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error,
    refetch,
  } = useOne<IWorkspace>({
    resource: `workspaces`,
    id: `${workspaceId}?includeMembers=true`,
    queryOptions: {
      enabled: !!workspaceId,
      retry: false,
    },
  });

  useEffect(() => {
    if (workspaceData?.data?.avatar) {
      setAvatarPreview(workspaceData.data.avatar);
    } else {
      setAvatarPreview(undefined);
    }
    setAvatarFile(null);

    form.setFieldsValue({
      visibility: workspaceData?.data?.visibility || WorkspaceVisibility.PUBLIC,
    });
  }, [workspaceData]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const workspace = useMemo(() => {
    if (isLoadingWorkspace) return {} as IWorkspace;

    return workspaceData?.data;
  }, [workspaceData]);

  const initialValues = useMemo<Record<string, any>>(
    () => ({
      name: workspace?.name,
      description: workspace?.description,
      visibility: workspace?.visibility || WorkspaceVisibility.PUBLIC,
    }),
    [workspace],
  );

  const canEdit = useMemo(() => {
    if (!user || !workspace) return false;

    return (
      user?.id === workspace?.owner?.id ||
      workspace?.members?.find(m => m.user.id === user?.id && m.role === MemberRole.ADMIN)
    );
  }, [user, workspace]);

  const handleSubmit = async (values: any) => {
    const pick = (obj: any) => ({
      name: obj.name,
      description: obj.description,
      visibility: obj.visibility,
    });

    const changedFields = Object.entries(pick(values)).filter(
      ([key, value]) => value !== initialValues[key],
    );

    const formData = new FormData();
    changedFields.forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    if (values.removeAvatar) {
      formData.append('removeAvatar', 'true');
    }

    onUpdate(
      {
        url: `workspaces/${workspaceId}`,
        method: 'patch',
        values: formData,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      },
      {
        onSuccess: () => {
          message.success('Cập nhật thông tin workspace thành công');
          setAvatarFile(null);
          onFormChange(false);
          refetch();
          refreshWorkspaces();
        },
        onError: () => {
          message.error('Cập nhật thông tin workspace thất bại');
        },
      },
    );
  };

  if (error) {
    return <Navigate to="/settings/workspaces" replace />;
  }
  const { data: membersData, isLoading: isLoadingMembers } = useList({
    resource: `workspaces/${workspaceId}/members`,
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: !!workspaceId,
      retry: false,
    },
  });

  const membersCount = membersData?.data?.length || 0;

  return (
    <div
      style={{
        maxWidth: '90%',
        height: '100%',
        margin: '0 auto',
      }}
    >
      {isLoadingWorkspace ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spinner size={28} />
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <Form
            layout="vertical"
            form={form}
            initialValues={{
              name: workspace?.name,
              description: workspace?.description,
              visibility: workspace?.visibility || WorkspaceVisibility.PUBLIC,
            }}
            onFinish={handleSubmit}
            onValuesChange={() => {
              const currentValues = form.getFieldsValue();
              const pick = (obj: any) => ({
                name: obj.name,
                description: obj.description,
                visibility: obj.visibility,
              });
              const changed = !isEqual(pick(currentValues), pick(initialValues));
              onFormChange(changed);
            }}
            style={{
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', gap: 20, width: '100%', height: '100%' }}>
              <div
                style={{
                  minWidth: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 15,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    background: '#f9f9f9',
                    padding: 12,
                    borderRadius: 12,
                  }}
                >
                  <Avatar
                    size={130}
                    src={avatarPreview}
                    style={{
                      backgroundColor: getColorFromName(workspace?.name),
                      color: avatarPreview ? 'transparent' : '#fff',
                      fontSize: 48,
                      fontWeight: 600,
                      transition: 'opacity 0.3s',
                      border: `1.5px solid ${getColorFromName(workspace?.name)}`,
                    }}
                    onError={() => false}
                  >
                    {!avatarPreview && getInitials(workspace?.name)}
                  </Avatar>
                  {canEdit && avatarPreview && (
                    <Button
                      type="text"
                      size="small"
                      icon={<IconX size={14} color="#333" />}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        borderRadius: 8,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(undefined);
                        form.setFieldsValue({ removeAvatar: true });
                        onFormChange(true);
                      }}
                    />
                  )}
                </div>

                {canEdit && (
                  <Upload
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={file => {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                      form.setFieldsValue({ removeAvatar: undefined });
                      onFormChange(true);
                      return false;
                    }}
                  >
                    <Button
                      icon={<IconUpload size={14} color="#333" />}
                      type="text"
                      style={{
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        padding: '4px 12px',
                        gap: 6,
                      }}
                      styles={{
                        icon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
                      }}
                    >
                      Thay đổi
                    </Button>
                  </Upload>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: isTablet ? 'column' : 'row',
                  height: '100%',
                  gap: 12,
                }}
              >
                <Card
                  style={{
                    flex: 3,
                    padding: 16,
                  }}
                  styles={{
                    body: {
                      padding: 0,
                      height: '100%',
                    },
                  }}
                >
                  <Form.Item name="removeAvatar" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item
                    label="Tên workspace"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên workspace' }]}
                  >
                    <Input placeholder="Nhập tên workspace" disabled={!canEdit} />
                  </Form.Item>
                  <Form.Item label="Mô tả" name="description">
                    <Input.TextArea
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      placeholder="Nhập mô tả workspace"
                      disabled={!canEdit}
                    />
                  </Form.Item>

                  <div
                    style={{
                      marginBottom: 24,
                      background: '#f5f5f5',
                      padding: '8px 12px',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Space direction="vertical" size={1}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        Hiển thị workspace công khai
                      </span>
                      <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>
                        Mọi người có thể tìm thấy workspace này khi tìm kiếm
                      </span>
                    </Space>
                    <Form.Item
                      name="visibility"
                      valuePropName="checked"
                      getValueFromEvent={checked =>
                        checked ? WorkspaceVisibility.PUBLIC : WorkspaceVisibility.PRIVATE
                      }
                      getValueProps={value => ({ checked: value === WorkspaceVisibility.PUBLIC })}
                      noStyle
                    >
                      <Switch size="small" disabled={!canEdit} />
                    </Form.Item>
                  </div>
                </Card>
                <Card
                  style={{
                    flex: 3,
                    padding: 16,
                  }}
                  styles={{
                    body: {
                      padding: 0,
                      height: '100%',
                    },
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Chủ sở hữu */}
                    <div style={{ paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                      <div
                        style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 10 }}
                      >
                        CHỦ SỞ HỮU
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar
                            size={32}
                            src={workspace?.owner?.avatar}
                            style={{
                              background: getColorFromName(workspace?.owner?.name),
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(workspace?.owner?.name)}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#222' }}>
                              {workspace?.owner?.name}
                            </div>
                            <div style={{ fontSize: 13, color: '#888' }}>
                              {workspace?.owner?.email}
                            </div>
                          </div>
                        </div>
                        {user?.id === workspace?.owner.id && (
                          <Tooltip title="Chuyển quyền sở hữu">
                            {workspace && (
                              <Button
                                type="primary"
                                icon={<IconTransfer size={16} color="#fff" />}
                                styles={{
                                  icon: {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  },
                                }}
                                onClick={() =>
                                  openModal('WorkspaceTransferOwnerModal', {
                                    workspaceId: workspace.id,
                                  })
                                }
                              />
                            )}
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        Ngày tạo:
                      </span>
                      <span style={{ fontSize: 14, color: '#222', fontWeight: 500 }}>
                        {workspace?.createdAt &&
                          dayjs(workspace.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                      </span>
                    </div>

                    {/* Cập nhật gần nhất */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        Cập nhật gần nhất:
                      </span>
                      <span style={{ fontSize: 14, color: '#222', fontWeight: 500 }}>
                        {workspace?.updatedAt &&
                          dayjs(workspace.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                      </span>
                    </div>

                    {/* Số thành viên */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>
                        Số thành viên:
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1677ff' }}>
                        {isLoadingMembers ? 'Đang tải...' : `${membersCount} thành viên`}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
});

export default WorkspaceInfo;
