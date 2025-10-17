import { WorkspaceVisibility } from '@/common/enum/workspace';
import { IWorkspace } from '@/common/types';
import Spinner from '@/components/ui/Spinner';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useOne } from '@refinedev/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { Avatar, Button, Card, Form, Input, message, Space, Switch, Upload } from 'antd';
import { isEqual } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface IWorkspaceInfoProps {
  onFormChange: (isChanged: boolean) => void;
  onUpdate: any;
}

const WorkspaceInfo = forwardRef(({ onFormChange, onUpdate }: IWorkspaceInfoProps, ref) => {
  const { refreshWorkspaces } = useWorkspaces();
  const { workspaceId } = useParams();
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  useImperativeHandle(ref, () => ({
    submit: () => form.submit(),
  }));

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error,
    refetch,
  } = useOne({
    resource: 'workspaces',
    id: workspaceId,
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

  const initialValues = useMemo(
    () => ({
      name: workspace?.name,
      description: workspace?.description,
      visibility: workspace?.visibility || WorkspaceVisibility.PUBLIC,
    }),
    [workspace],
  );

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'removeAvatar') formData.append(key, value as any);
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

  return (
    <div
      style={{
        maxWidth: '80%',
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
          >
            <div style={{ display: 'flex', gap: 20, width: '100%' }}>
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
                  {avatarPreview && (
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
              </div>

              <Card
                style={{
                  flex: 1,
                  padding: 16,
                }}
                styles={{
                  body: {
                    maxHeight: 'fit-content',
                    padding: 0,
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
                  <Input placeholder="Nhập tên workspace" />
                </Form.Item>
                <Form.Item label="Mô tả" name="description">
                  <Input.TextArea rows={3} placeholder="Nhập mô tả workspace" />
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
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </Card>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
});

export default WorkspaceInfo;
