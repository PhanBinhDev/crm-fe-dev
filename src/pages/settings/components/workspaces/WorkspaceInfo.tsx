import { MemberRole, MemberStatus, WorkspaceVisibility } from '@/common/enum/workspace';
import { IWorkspace } from '@/common/types';
import { IMember } from '@/common/types/workspaces';
import CustomAvatar from '@/components/ui/CustomAvatar';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useOne } from '@refinedev/core';
import { IconTransfer, IconUpload, IconX } from '@tabler/icons-react';
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tooltip,
  Upload,
} from 'antd';
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

  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | undefined>();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

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
  console.log('workspace', workspace);

  const eligibleMembersForTransfer = useMemo(() => {
    if (!workspace || !workspace.members) return [];

    return workspace.members
      .filter(
        (m: IMember) =>
          (m.role === MemberRole.ADMIN || m.role === MemberRole.MEMBER) &&
          m.status === MemberStatus.ACTIVE,
      )
      .map((member: IMember) => ({
        label: `${member.user.name} (${member.user.email})`,
        value: member.user.id,
      }));
  }, [workspace]);

  const canTransferOwnership = eligibleMembersForTransfer.length > 0;

  const canEdit = useMemo(() => {
    if (!user || !workspace) return false;

    return (
      user?.id === workspace?.owner?.id ||
      workspace?.members?.find(m => m.user.id === user?.id && m.role === MemberRole.ADMIN)
    );
  }, [user, workspace]);

  const tooltipTitle = useMemo(() => {
    if (user?.id !== workspace?.owner?.id) {
      return 'Chỉ chủ sở hữu mới có thể chuyển quyền.';
    }
    if (!canTransferOwnership) {
      return 'Không có thành viên đủ điều kiện để chuyển giao.';
    }
    return 'Chuyển quyền sở hữu';
  }, [user, workspace, canTransferOwnership]);

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
      message.warning(
        'Workspace cần ít nhất 1 thành viên khác chủ sở hữu hiện tại để chuyển quyền.',
      );
      return;
    }

    setNewOwnerId(undefined);
    setIsTransferModalVisible(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalVisible(false);
  };

  const handleTransfer = () => {
    message.loading('Đang chuyển quyền sở hữu...');

    setIsConfirmModalVisible(false);

    if (!workspaceId) {
      console.error('workspaceId is undefined');
      message.error('Không thể thực hiện hành động vì workspaceId không hợp lệ.');
      return;
    }

    onUpdate(
      {
        url: `workspaces/${workspaceId}/transfer-ownership`,
        method: 'patch',
        values: { newOwnerId },
      },
      {
        onSuccess: () => {
          message.success('Chuyển quyền sở hữu thành công!');
          closeTransferModal();
          refetch();
          refreshWorkspaces();
        },
        onError: (error: unknown) => {
          message.error(`Lỗi server: ${error instanceof Error ? error.message : 'Không xác định'}`);
        },
      },
    );
  };

  const confirmOwnershipTransfer = () => {
    if (!canTransferOwnership) {
      message.error('Không có thành viên đủ điều kiện');
      return;
    }
    if (!newOwnerId) {
      message.error('Vui lòng chọn người nhận quyền sở hữu mới.');
      return;
    }

    closeTransferModal();
    setIsConfirmModalVisible(true);
  };

  if (error) {
    return <Navigate to="/settings/workspaces" replace />;
  }

  return (
    <App>
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
                          Mọi người có thể nhìn thấy workspace này
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
                                border: 'none',
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

                          <Tooltip title={tooltipTitle}>
                            <div>
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
                                onClick={showTransferModal}
                                disabled={
                                  user?.id !== workspace?.owner?.id || !canTransferOwnership
                                }
                                style={{ display: 'inline-block' }}
                              />
                            </div>
                          </Tooltip>
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
                          {workspace?.members?.filter(member => member.status === 'active')
                            .length ||
                            0 ||
                            1}{' '}
                          thành viên
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Form>
            <Modal
              title={
                <span style={{ fontWeight: 700, fontSize: 18, color: '#1f2937' }}>
                  Chuyển Quyền Sở Hữu
                </span>
              }
              open={isTransferModalVisible}
              footer={null}
              onCancel={closeTransferModal}
              centered
              width={480}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 0 0 0' }}>
                <div
                  style={{
                    background: '#fef2f2',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 20,
                    borderLeft: '4px solid #ef4444',
                  }}
                >
                  <h3 style={{ color: '#dc2626', fontWeight: 700, fontSize: 16, margin: 0 }}>
                    CẢNH BÁO NGUY HIỂM VÀ KHÔNG THỂ HOÀN TÁC!
                  </h3>
                  <p style={{ color: '#b91c1c', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
                    Hành động này sẽ <strong>vĩnh viễn</strong> chuyển giao quyền sở hữu và bạn sẽ
                    mất tất cả quyền quản trị cao nhất. Vui lòng chọn cẩn thận!
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
                    status={!newOwnerId ? 'error' : undefined}
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
                    height: 40,
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
              onOk={handleTransfer}
              okButtonProps={{
                style: {
                  borderRadius: 8,
                  height: 35,
                  width: '40%',
                  fontWeight: 600,
                  backgroundColor: '#dc2626',
                  borderColor: '#dc2626',
                  color: '#ffffff',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                },
              }}
              cancelButtonProps={{
                style: {
                  borderRadius: 8,
                  height: 35,
                  width: '40%',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  borderColor: '#d1d5db',
                  color: '#374151',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
              footer={(_, { OkBtn, CancelBtn }) => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 16 }}>
                  <CancelBtn />
                  <OkBtn />
                </div>
              )}
            >
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    margin: '0 auto 24px',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#fef2f2',
                    border: '2px solid #dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
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
