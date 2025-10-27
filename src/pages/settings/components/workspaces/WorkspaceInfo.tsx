import { MemberRole, WorkspaceVisibility } from '@/common/enum/workspace';
import { IWorkspace } from '@/common/types';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useOne } from '@refinedev/core';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useMediaQuery } from 'usehooks-ts';

const MemberRole = {
    ADMIN: 'admin',
    MEMBER: 'member',
    OWNER: 'owner',
};
const WorkspaceVisibility = {
    PUBLIC: 'public',
    PRIVATE: 'private',
};

interface IUser { id: string; name: string; email: string; avatar?: string; }
interface IMember { user: IUser; role: string; status: string; createdBy: string; createdAt: string; }
interface IWorkspace { 
    name: string; 
    description: string; 
    visibility: string; 
    owner: IUser; 
    members: IMember[];
    createdAt: string;
    updatedAt: string;
    avatar?: string;
}

const getColorFromName = (name: string | undefined): string => {
    if (!name) return '#cccccc';
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#5D5FEF', '#34C759', '#FF9500', '#007AFF', '#FF2D55'];
    return colors[hash % colors.length];
};
const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

interface IWorkspaceInfoProps {
  onFormChange: (isChanged: boolean) => void;
  onUpdate: any;
}

const WorkspaceInfo = forwardRef(({ onFormChange, onUpdate }: IWorkspaceInfoProps, ref) => {
  const { refreshWorkspaces } = useWorkspaces();
  const { user } = useAuth();
  const { workspaceId } = useParams();
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | undefined>();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error,
    refetch,
  } = useOne({
    resource: `workspaces`,
    id: `${workspaceId}?includeMembers=true`,
    queryOptions: {
      enabled: !!workspaceId,
      retry: false,
    },
  });

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
  }, [workspaceData, form]);

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

  const eligibleMembersForTransfer = useMemo(() => {
    const activeMembers = workspace?.members?.filter((m: IMember) => m.user.id !== user?.id) || [];
    return activeMembers.map((member: IMember) => ({
      label: `${member.user.name} (${member.user.email})`,
      value: member.user.id,
    }));
  }, [workspace, user]);

  const canEdit = useMemo(() => {
    if (!user || !workspace) return false;

    return (
      user?.id === workspace?.owner?.id ||
      workspace?.members?.find((m: IMember) => m.user.id === user?.id && m.role === MemberRole.ADMIN)
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

  const showTransferModal = () => {
    if (!canTransferOwnership) {
        message.warning('Workspace cần ít nhất 1 thành viên khác chủ sở hữu hiện tại để chuyển quyền.');
        return;
    }

    setNewOwnerId(undefined);
    setIsTransferModalVisible(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalVisible(false);
  };

  const canTransferOwnership = eligibleMembersForTransfer.length > 0;

  if (error) {
    return <Navigate to="/settings/workspaces" replace />;
  }

  const handleTransfer = (closeConfirmModal: () => void) => {
    message.loading('Đang chuyển quyền sở hữu...');

    onUpdate(
      {
        url: `workspaces/${workspaceId}/transfer-ownership`,
        method: 'patch',
        values: { newOwnerId },
      },
      {
        onSuccess: () => {
          message.success('Chuyển quyền sở hữu thành công!');
          closeConfirmModal();
          closeTransferModal();
          refetch();
          refreshWorkspaces();
          
          onUpdate(
            {
              url: `workspaces/${workspaceId}/leave`,
              method: 'post',
            },
            {
              onSuccess: () => {
                message.success('Bạn đã rời khỏi workspace.');
              },
              onError: () => {
                message.error('Không thể rời khỏi workspace, vui lòng thử lại.');
              },
            },
          );
        },
        onError: () => {
          message.error('Chuyển quyền sở hữu thất bại, vui lòng thử lại.');
        },
      },
    );
  }


  const showMessage = (type: 'success' | 'error' | 'info' | 'warning' | 'loading', content: string) => {
    message[type](content);
  };

  const confirmOwnershipTransfer = () => {
    if (!canTransferOwnership) {
      showMessage('error', 'Không có thành viên đủ điều kiện.');
      return;
    }
    if (!newOwnerId) {
      showMessage('error', 'Vui lòng chọn người nhận quyền sở hữu mới.');
      return;
    }

    closeTransferModal();
    setIsConfirmModalVisible(true);
  };

  const isTablet = useMediaQuery('(max-width: 991px)');

  return (
    <App>
      <div
        style={{
          maxWidth: '1000px',
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
              padding: isTablet ? '16px' : '20px 0',
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Thông tin cơ bản</h2>
            {workspace && (
              <div>
                <Form
                  form={form} 
                  layout="vertical"
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
                  <CustomAvatar
                    size={130}
                    name={workspace?.name || 'W'}
                    src={avatarPreview}
                    style={{
                      border: `1.5px solid ${getColorFromName(workspace?.name)}`,
                      transition: 'opacity 0.3s',
                      fontSize: 48,
                      fontWeight: 600,
                    }}
                  />

                  {canEdit && avatarPreview && (
                    <Button
                      type="text"
                      size="small"
                      icon={<IconX size={14} color="#333" />}
                      style={{
                        position: 'relative',
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
                          border: `3px solid ${getColorFromName(workspace?.name)}`,
                        }}
                        onError={() => false}
                      >
                        {!avatarPreview && getInitials(workspace?.name)}
                      </Avatar>
                      {canEdit && avatarPreview && (
                        <Button
                          type="text"
                          size="small"
                          icon={<IconX size={14} color="#dc2626" />}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: '1px solid #dc2626',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            padding: '4px',
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '24px',
                            width: '24px'
                          }}
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(undefined);
                            form.setFieldsValue({ removeAvatar: true });
                            onFormChange(true);
                            message.warning('Avatar sẽ bị xóa khi lưu.');
                          }}
                        />
                      )}
                    </div>

                    {canEdit && (
                      <Upload
                        showUploadList={false}
                        accept="image/*"
                        beforeUpload={file => {
                          setAvatarFile(file as File);
                          setAvatarPreview(URL.createObjectURL(file as File));
                          form.setFieldsValue({ removeAvatar: undefined });
                          onFormChange(true);
                          return false;
                        }}
                      >
                        <Button
                          icon={<IconUpload size={16} color="#1677ff" />}
                          type="default"
                          style={{
                            borderColor: '#1677ff',
                            color: '#1677ff',
                            borderRadius: 8,
                            padding: '6px 16px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          Tải ảnh lên
                        </Button>
                      </Upload>
                    )}
                    <Form.Item name="removeAvatar" hidden>
                      <Input type="hidden" />
                    </Form.Item>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: isTablet ? 'column' : 'row',
                      height: '100%',
                      gap: 24,
                    }}
                  >
                  
                    <Card
                      variant="outlined"
                      style={{
                        flex: 2.5,
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      }}
                      styles={{
                        body: {
                          padding: 20,
                          height: '100%',
                        },
                      }}
                    >
                      <Form.Item
                        label={<span style={{ fontWeight: 600, fontSize: 14 }}>Tên Workspace</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên workspace' }]}
                        style={{ marginBottom: 16 }}
                      >
                        <Input 
                          placeholder="Nhập tên workspace" 
                          disabled={!canEdit} 
                          style={{ borderRadius: 6, height: 40 }}
                        />
                      </Form.Item>
                      <Form.Item 
                        label={<span style={{ fontWeight: 600, fontSize: 14 }}>Mô tả</span>}
                        name="description"
                        style={{ marginBottom: 24 }}
                      >
                        <Input.TextArea
                          autoSize={{ minRows: 3, maxRows: 5 }}
                          placeholder="Nhập mô tả chi tiết về workspace"
                          disabled={!canEdit}
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>

                  
                      <div
                        style={{
                          background: canEdit ? '#f0f4ff' : '#f5f5f5',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: canEdit ? '1px solid #b3caff' : '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.3s',
                        }}
                      >
                        <Space direction="vertical" size={2}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>
                            Hiển thị công khai
                          </span>
                          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 400 }}>
                            Mọi người có thể tìm thấy workspace này khi tìm kiếm.
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
                          <Switch size="default" disabled={!canEdit} />
                        </Form.Item>
                      </div>
                    </Card>

                
                    <Card
                      variant="outlined"
                      style={{
                        flex: 2,
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      }}
                      styles={{
                        body: {
                          padding: 20,
                          height: '100%',
                        },
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                     
                        <div style={{ paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                          <div
                            style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}
                          >
                            CHỦ SỞ HỮU
                          </div>
                          <div
                            style={{
                              background: getColorFromName(workspace?.owner?.name),
                              fontSize: 14,
                              fontWeight: 600,
                              border: 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <Avatar
                                size={40}
                                src={workspace?.owner?.avatar}
                                style={{
                                  background: getColorFromName(workspace?.owner?.name),
                                  fontSize: 16,
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(workspace?.owner?.name)}
                              </Avatar>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>
                                  {workspace?.owner?.name}
                                </div>
                                <div style={{ fontSize: 13, color: '#6b7280' }}>
                                  {workspace?.owner?.email}
                                </div>
                              </div>
                            </div>
                            {user?.id === workspace?.owner.id ? (
                              <Tooltip title="Chuyển quyền sở hữu">
                                <span>
                                  <Button
                                    type="primary"
                                    icon={<IconTransfer size={16} color="#fff" />}
                                    onClick={showTransferModal}
                                    disabled={!canTransferOwnership}
                                    style={{
                                      borderRadius: 8,
                                      backgroundColor: canTransferOwnership ? '#1677ff' : '#f0f0f0',
                                      color: canTransferOwnership ? '#fff' : '#a6a6a6',
                                      border: 'none',
                                      padding: '8px',
                                      height: 'auto',
                                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    }}
                                  />
                                </span>
                              </Tooltip>
                            ) : (
                              <Button
                                type="primary"
                                icon={<IconTransfer size={16} color="#fff" />}
                                disabled
                                style={{ 
                                  borderRadius: 8, 
                                  backgroundColor: '#f0f0f0', 
                                  color: '#a6a6a6', 
                                  border: 'none', 
                                  padding: '8px', 
                                  height: 'auto',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                            )}
                          </div>
                        </div>


                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                          }}
                        >
                          <span style={{ fontSize: 14, color: '#4b5563', fontWeight: 500 }}>
                            Ngày tạo:
                          </span>
                          <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 600 }}>
                            {workspace?.createdAt &&
                              dayjs(workspace.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                          </span>
                        </div>

                      
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                          }}
                        >
                          <span style={{ fontSize: 14, color: '#4b5563', fontWeight: 500 }}>
                            Cập nhật gần nhất:
                          </span>
                          <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 600 }}>
                            {workspace?.updatedAt &&
                              dayjs(workspace.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                          </span>
                        </div>

          
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '4px 0',
                          }}
                        >
                          <span style={{ fontSize: 14, color: '#4b5563', fontWeight: 500 }}>
                            Số thành viên:
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1677ff' }}>
                            {workspace?.members?.length || 1} thành viên
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Form>
              </div>
            )}
         
            <Modal
              title={<span style={{ fontWeight: 700, fontSize: 18, color: '#1f2937' }}>Chuyển Quyền Sở Hữu</span>}
              open={isTransferModalVisible}
              footer={null}
              onCancel={closeTransferModal}
              centered
              width={480}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 0 0 0' }}>
                
               
                <div style={{ 
                    background: '#fef2f2', 
                    padding: 16, 
                    borderRadius: 8, 
                    marginBottom: 20, 
                    borderLeft: '4px solid #ef4444' 
                }}>
                  <h3 style={{ color: '#dc2626', fontWeight: 700, fontSize: 16, margin: 0 }}>
                    CẢNH BÁO NGUY HIỂM VÀ KHÔNG THỂ HOÀN TÁC!
                  </h3>
                  <p style={{ color: '#b91c1c', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
                    Hành động này sẽ <strong>vĩnh viễn</strong> chuyển giao quyền sở hữu và bạn sẽ mất tất cả
                    quyền quản trị cao nhất. Vui lòng chọn cẩn thận!
                  </p>
                </div>
                

                <div style={{ marginBottom: 20 }}>
                  <label
                    htmlFor="new-owner-select"
                    style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8 }}
                  >
                    Chọn Thành viên sẽ trở thành Chủ sở hữu mới
                  </label>
                  <Select
                    id="new-owner-select"
                    style={{ width: '100%' }}
                    placeholder="-- Chọn một Thành viên --"
                    options={eligibleMembersForTransfer}
                    onChange={value => {
                      setNewOwnerId(value);
                    }}
                    value={newOwnerId} 
                    size="large" 
                    status={newOwnerId ? '' : 'error'}
                  />
                   {!newOwnerId && (
                      <p style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                          Vui lòng chọn người nhận quyền sở hữu.
                      </p>
                  )}
                </div>
                


                <Button
                  type="primary"
                  danger
                  style={{ 
                    marginTop: 10,
                    width: '100%', 
                    height: 48,
                    fontWeight: 700,
                    borderRadius: 8,
                    opacity: !newOwnerId || !canTransferOwnership ? 0.6 : 1,
                    backgroundColor: '#ef4444',
                    boxShadow: '0 4px 8px rgba(239, 68, 68, 0.2)',
                    transition: 'all 0.3s',
                  }}
                  onClick={confirmOwnershipTransfer}
                  disabled={!newOwnerId || !canTransferOwnership}
                >
                  Xác Nhận
                </Button>
              </div>
            </Modal>


            <Modal
              open={isConfirmModalVisible}
              onCancel={() => setIsConfirmModalVisible(false)}
              centered
              okText="Xác Nhận"
              cancelText="Hủy"
              okType="danger"
              closable
              width={380}
              maskClosable
              onOk={() => handleTransfer(() => setIsConfirmModalVisible(false))}
            >
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ margin: '0 auto 24px', width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fef2f2', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L1 21H23L12 2Z" fill="#dc2626" />
                    <path d="M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="16" r="1" fill="white" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
                  Hành động này <strong style={{ color: '#dc2626' }}>không thể hoàn tác</strong>.
                  <br />
                  Vui lòng xác nhận nếu bạn muốn chuyển giao vĩnh viễn quyền sở hữu.
                </p>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </App>
  );
});

export default WorkspaceInfo;