import { WorkspaceVisibility } from '@/common/enum/workspace';
import Spinner from '@/components/ui/Spinner';
import { getColorFromName, getInitials } from '@/utils/activity';
import { useOne } from '@refinedev/core';
import { IconUpload } from '@tabler/icons-react';
import { Avatar, Button, Card, Form, Input, Space, Switch, Upload } from 'antd';
import { isEqual } from 'lodash';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface IWorkspaceInfoProps {
  onFormChange: (isChanged: boolean) => void;
}

const WorkspaceInfo = forwardRef(({ onFormChange }: IWorkspaceInfoProps, ref) => {
  const { workspaceId } = useParams();
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    submit: () => form.submit(),
  }));

  const {
    data: workspaceData,
    isLoading: isLoadingWorkspace,
    error,
  } = useOne({
    resource: 'workspaces',
    id: workspaceId,
    queryOptions: {
      enabled: !!workspaceId,
      retry: false,
    },
  });

  const workspace = useMemo(() => {
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

  const handleSubmit = async (values: any) => {};

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
              const changed = !isEqual(currentValues, initialValues);
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
                <div style={{ position: 'relative' }}>
                  <Avatar
                    size={130}
                    src={workspace?.avatar}
                    style={{
                      backgroundColor: getColorFromName(workspace?.name),
                      color: workspace?.avatar ? 'transparent' : '#fff',
                      fontSize: 48,
                      fontWeight: 600,
                      transition: 'opacity 0.3s',
                      border: 'none',
                    }}
                    onError={() => {
                      return false;
                    }}
                  >
                    {!workspace?.avatar && getInitials(workspace?.name)}
                  </Avatar>
                </div>

                <Upload showUploadList={false} accept=".jpg,.jpeg,.png">
                  <Button
                    icon={<IconUpload size={16} color="#333" />}
                    type="text"
                    style={{
                      border: '1px solid #d9d9d9',
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
                <Form.Item
                  style={{ marginBottom: 24 }}
                  name="visibility"
                  valuePropName="checked"
                  getValueFromEvent={checked => (checked ? 'public' : 'private')}
                  getValueProps={value => ({ checked: value === 'public' })}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f5f5f5',
                      padding: '8px 12px',
                      borderRadius: 8,
                    }}
                  >
                    <Space direction="vertical" size={1}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        Hiển thị workspace công khai
                      </span>
                      <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>
                        Chỉ bạn và các thành viên được mời mới có quyền truy cập.
                      </span>
                    </Space>
                    <Switch size="small" />
                  </div>
                </Form.Item>
              </Card>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
});

export default WorkspaceInfo;
