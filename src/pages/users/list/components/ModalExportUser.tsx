import { FC, useState } from "react";
import { Modal, Button, InputNumber, Select } from "antd";
import { IconDownload } from "@tabler/icons-react";
import { IUser } from "@/common/types";
import { exportUsersToCSV } from "@/services/utils/exportUtils";

const USER_FIELDS = [
  { label: "Họ tên", value: "name" },
  { label: "Tên đăng nhập", value: "username" },
  { label: "Email", value: "email" },
  { label: "Số điện thoại", value: "phone" },
  { label: "Vai trò", value: "role" },
  { label: "Ngày sinh", value: "dateOfBirth" },
  { label: "Chuyên ngành", value: "major" },
  { label: "Trạng thái", value: "isActive" },
  { label: "Ngày tạo", value: "createdAt" },
];

interface ModalExportUserProps {
  open: boolean;
  onClose: () => void;
  users: IUser[];
}

export const ModalExportUser: FC<ModalExportUserProps> = ({
  open,
  onClose,
  users,
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    USER_FIELDS.map((f) => f.value)
  );
  const [downloading, setDownloading] = useState(false);
  const [limit, setLimit] = useState<number | undefined>(undefined);

  const handleDownload = async () => {
    setDownloading(true);
    let exportList = users;
    if (typeof limit === "number" && limit > 0) {
      exportList = users.slice(0, limit);
    }
    await exportUsersToCSV(exportList, selectedFields);
    setDownloading(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={520}
    >
      {/* Header */}
      <div
        style={{
          paddingBottom: 16,
          borderBottom: "1px solid #f0f0f0",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            margin: 0,
            color: "#1a1a1a",
          }}
        >
          Xuất dữ liệu
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#555",
            margin: "4px 0 0 0",
          }}
        >
          Dữ liệu sẽ được xuất ra file Excel
        </p>
      </div>

      {/* Limit */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#333" }}>
            Giới hạn
          </span>
          <InputNumber
            min={1}
            max={users.length}
            value={limit}
            onChange={(value) => setLimit(value === null ? undefined : value)}
            placeholder={`Tối đa: ${users.length}`}
            style={{ width: 100 }}
          />
        </div>
        <p style={{ fontSize: "0.85rem", color: "#888", marginTop: 4 }}>
          Nếu không nhập, hệ thống sẽ xuất toàn bộ dữ liệu
        </p>
      </div>

      {/* Choose Columns */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#333" }}>
          Chọn cột
        </span>
        <Select
          mode="multiple"
          value={selectedFields}
          onChange={(values) => setSelectedFields(values)}
          options={USER_FIELDS}
          style={{ minWidth: 180 }}
          maxTagCount={0}
          dropdownStyle={{ minWidth: 240, padding: 0 }}
          placeholder={`Cột (${selectedFields.length})`}
          maxTagPlaceholder={() => `Cột (${selectedFields.length})`}
          suffixIcon={<span style={{ fontSize: 12 }}>▼</span>}
          dropdownRender={() => (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {/* Chọn/Bỏ chọn tất cả */}
              <div
                onClick={() => {
                  if (selectedFields.length === USER_FIELDS.length) {
                    setSelectedFields([]);
                  } else {
                    setSelectedFields(USER_FIELDS.map((f) => f.value));
                  }
                }}
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fafafa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                <span>
                  {selectedFields.length === USER_FIELDS.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </span>
                {selectedFields.length === USER_FIELDS.length && (
                  <span
                    style={{
                      color: "red",
                      fontWeight: 600,
                      minWidth: 18,
                      textAlign: "right",
                    }}
                  >
                    ❌
                  </span>
                )}
              </div>

              {/* Các cột */}
              {USER_FIELDS.map((field) => {
                const isSelected = selectedFields.includes(field.value);

                return (
                  <div
                    key={field.value}
                    onClick={() => {
                      const newSelected = isSelected
                        ? selectedFields.filter((f) => f !== field.value)
                        : [...selectedFields, field.value];
                      setSelectedFields(newSelected);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    {/* Label */}
                    <span
                      style={
                        isSelected
                          ? {
                              background: "#f5f5f5",
                              padding: "2px 6px",
                              borderRadius: 6,
                              fontSize: "0.95rem",
                            }
                          : {}
                      }
                    >
                      {field.label}
                    </span>

                    {/* Icon ✔ xanh dương */}
                    {isSelected && (
                      <span
                        style={{
                          color: "#1677ff",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          minWidth: 18,
                          textAlign: "right",
                        }}
                      >
                        ✔
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        />
      </div>

      {/* Hiển thị danh sách đã chọn */}
      <div
        style={{
          marginTop: 12,
          fontSize: "0.95rem",
          color: "#333",
          border: "1px solid #e5e5e5",
          borderRadius: 6,
          padding: "8px 12px",
          background: "#fafafa",
          minHeight: 50,
          userSelect: "none",
          cursor: "default",
        }}
      >
        {USER_FIELDS.filter((f) => selectedFields.includes(f.value))
          .map((f) => f.label)
          .join(", ")}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 24,
        }}
      >
        <Button onClick={onClose} disabled={downloading}>
          Hủy
        </Button>
        <Button
          type="primary"
          icon={<IconDownload size={16} />}
          onClick={handleDownload}
          disabled={selectedFields.length === 0 || downloading}
          loading={downloading}
        >
          Xuất file
        </Button>
      </div>
    </Modal>
  );
};
