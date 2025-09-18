import React, { useState } from "react";
import SelectIcon from "../shared/SelectIcon";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tooltip,
  Button,
  Typography,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { IUser } from "../../common/types/users";
import { UserRole } from "../../common/enum/user";
import { useModal } from "@/hooks/useModal";
import { useList } from "@refinedev/core";
import { message } from "antd";

const ModalAddWorkspace: React.FC = () => {
  const { type, isOpen, closeModal } = useModal();
  const isModalOpen = type === "ModalAddWorkspace" && isOpen;
  const { Text } = Typography;

  const { data: usersData } = useList({
    resource: "users/all",
    config: { pagination: { mode: "off" } },
    queryOptions: { enabled: isModalOpen },
  });
  const [form] = Form.useForm();
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<IUser[]>([]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // TODO: Gọi API tạo workspace ở đây
        message.success("Tạo workspace thành công!");
        form.resetFields();
        setInviteMembers([]);
        setIsPrivate(false);
        closeModal();
      })
      .catch(() => {});
  };

  const handleTogglePrivate = (checked: boolean) => {
    setIsPrivate(checked);
    form.setFieldsValue({ isPrivate: checked });
  };

  return (
    <Modal
      title="Tạo Space mới"
      open={isModalOpen}
      onCancel={closeModal}
      footer={[
        <Button key="cancel" onClick={closeModal}>
          Hủy
        </Button>,
        <Button key="create" type="primary" onClick={handleSubmit}>
          Tạo Space
        </Button>,
      ]}
      width={600}
      centered
      destroyOnClose
    >
      <div style={{ marginBottom: 24, color: "#8c8c8c" }}>
        <Text>Một Space đại diện cho các nhóm, phòng ban hoặc các nhóm khác, mỗi nhóm có Danh sách, quy trình làm việc và cài đặt riêng.</Text>
      </div>

      <Form layout="vertical" form={form} initialValues={{ permission: "full" }}>
        {/* Icon & Tên Space */}
        <Form.Item
          label={
            <span>
              <span style={{ color: "red" }}>*</span> Icon & Tên Space
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Form.Item name="icon" noStyle style={{ marginBottom: 0 }}>
                <div style={{
                  height: 44,
                  width: 56,
                  minWidth: 56,
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 0
                }}>
                  <SelectIcon
                    value={form.getFieldValue("icon")}
                    onChange={(icon: string) => form.setFieldsValue({ icon })}
                    size={28}
                  />
                </div>
              </Form.Item>
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên Space" }]}
                style={{ marginBottom: 0, width: '100%' }}
              >
                <Input placeholder="VD: Marketing, Kỹ thuật, HR" style={{ height: 44, fontSize: 16, borderRadius: 8, background: '#fff', border: '1px solid #e0e0e0' }} />
              </Form.Item>
            </div>
        </Form.Item>

        {/* Mô tả */}
        <Form.Item label="Mô tả (tùy chọn)" name="description" style={{ marginBottom: 24 }}>
          <Input.TextArea rows={2} placeholder="Nhập mô tả cho Space (không bắt buộc)" />
        </Form.Item>

        {/* Quyền mặc định và switch riêng tư */}
        {!isPrivate && (
          <Form.Item style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <span style={{ fontWeight: 500, fontSize: 16 }}>
                Quyền mặc định
                <Tooltip
                  title={
                    <div>
                      <p>
                        <strong>Toàn quyền sửa</strong>
                        <br />
                        Có thể tạo và chỉnh sửa các thực thể trong Space này. Chủ sở hữu và quản trị viên có thể quản lý cài đặt Space.
                      </p>
                      <p>
                        <strong>Chỉnh sửa</strong>
                        <br />
                        Có thể tạo và chỉnh sửa các thực thể trong Space này. Không thể quản lý cài đặt Space hoặc xóa các thực thể.
                      </p>
                      <p>
                        <strong>Bình luận</strong>
                        <br />
                        Có thể bình luận về các thực thể trong Space này. Không thể quản lý cài đặt Space hoặc chỉnh sửa các thực thể.
                      </p>
                      <p>
                        <strong>Chỉ xem</strong>
                        <br />
                        Chỉ đọc. Không thể chỉnh sửa hoặc bình luận về các thực thể trong Space này ngoài Chat. Có thể cộng tác trong Chat.
                      </p>
                    </div>
                  }
                >
                  <InfoCircleOutlined style={{ marginLeft: 4, color: "#8c8c8c" }} />
                </Tooltip>
              </span>
              <Form.Item name="permission" noStyle>
                <Select
                  style={{ width: 150 }}
                  options={[
                    { value: "full", label: "Toàn quyền sửa" },
                    { value: "edit", label: "Chỉnh sửa" },
                    { value: "comment", label: "Bình luận" },
                    { value: "view", label: "Chỉ xem" },
                  ]}
                />
              </Form.Item>
            </div>
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <Text strong>Tạo Space riêng tư</Text>
              <br />
              <Text type="secondary">Chỉ bạn và các thành viên được mời có quyền truy cập</Text>
            </div>
            <Switch checked={isPrivate} onChange={handleTogglePrivate} />
          </div>
        </Form.Item>

        {isPrivate && (
          <Form.Item
            label="Chia sẻ chỉ với:"
            name="inviteMembers"
            style={{ marginTop: 12 }}
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Nhập email thành viên để mời"
              value={inviteMembers.map((m) => m.email)}
              onChange={(emails) => {
                const newMembers = emails.map((email) => ({
                  id: email, // Giả định id là email để đơn giản
                  email: email,
                  // Các trường khác có thể để trống hoặc thêm tùy ý
                  name: "",
                  username: "",
                  phone: "",
                  role: UserRole.CNBM,
                  dateOfBirth: "",
                  avatar: "",
                  major: "",
                  isActive: true,
                  assignedActivities: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }));
                setInviteMembers(newMembers);
              }}
              options={
                Array.isArray(usersData?.data)
                  ? (usersData.data as IUser[]).map((u) => ({
                      value: u.email,
                      label: u.email,
                    }))
                  : []
              }
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ModalAddWorkspace;