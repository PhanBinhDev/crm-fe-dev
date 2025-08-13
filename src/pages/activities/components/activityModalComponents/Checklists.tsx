import { IUser } from '@/common/types';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  MoreOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Form, Input, Select } from 'antd';
import { FormInstance } from 'antd';
interface ChecklistsProps {
  form: FormInstance;
  users: any;
}

const Checklists: React.FC<ChecklistsProps> = ({ form, users }) => {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Form.List name="checklist">
          {(fields, { add, remove, move }) => (
            <>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: fields.length > 0 ? 12 : 8,
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#202020',
                    fontWeight: 500,
                    letterSpacing: '0.3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <CheckSquareOutlined style={{ color: '#8c8c8c' }} />
                  Checklists
                  {fields.length > 0 && (
                    <span
                      style={{
                        background: '#edf2f7',
                        color: '#4a5568',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        minWidth: '18px',
                        textAlign: 'center',
                      }}
                    >
                      {fields.length}
                    </span>
                  )}
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={() =>
                    add({
                      title: '',
                      items: [{ text: '', completed: false, assignee: null }],
                      collapsed: false,
                    })
                  }
                  style={{
                    color: '#1890ff',
                    fontSize: '12px',
                    fontWeight: 500,
                    height: '24px',
                    padding: '0 8px',
                  }}
                >
                  + Tạo checklist
                </Button>
              </div>

              {/* Checklist Items */}
              {fields.map(({ key, name }, checklistIndex) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 12,
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: '#ffffff',
                  }}
                >
                  {/* Checklist Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderBottom: '1px solid #f1f5f9',
                      background: '#f8f9fa',
                      borderRadius: '6px 6px 0 0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Button
                        type="text"
                        size="small"
                        icon={
                          form.getFieldValue(['checklist', checklistIndex, 'collapsed']) ? (
                            <RightOutlined style={{ fontSize: '10px' }} />
                          ) : (
                            <DownOutlined style={{ fontSize: '10px' }} />
                          )
                        }
                        onClick={() => {
                          const currentValue = form.getFieldValue([
                            'checklist',
                            checklistIndex,
                            'collapsed',
                          ]);
                          form.setFieldValue(
                            ['checklist', checklistIndex, 'collapsed'],
                            !currentValue,
                          );
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          minWidth: '20px',
                          color: '#64748b',
                        }}
                      />
                      <Form.Item name={[name, 'title']} style={{ margin: 0, flex: 1 }}>
                        <Input
                          placeholder="Nhập tên checklist"
                          variant="borderless"
                          size="small"
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#374151',
                          }}
                        />
                      </Form.Item>
                    </div>

                    {/* Checklist Actions Dropdown */}
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'rename',
                            label: 'Đổi tên',
                            icon: <EditOutlined />,
                            onClick: () => {
                              // Focus vào input title
                              const titleInput = document.querySelector(
                                `[name="checklist_${checklistIndex}_title"]`,
                              ) as HTMLInputElement;
                              if (titleInput) titleInput.focus();
                            },
                          },
                          {
                            key: 'moveup',
                            label: 'Di chuyển lên',
                            icon: <ArrowUpOutlined />,
                            disabled: checklistIndex === 0,
                            onClick: () => move(checklistIndex, checklistIndex - 1),
                          },
                          {
                            key: 'movedown',
                            label: 'Di chuyển xuống',
                            icon: <ArrowDownOutlined />,
                            disabled: checklistIndex === fields.length - 1,
                            onClick: () => move(checklistIndex, checklistIndex + 1),
                          },
                          {
                            type: 'divider',
                          },
                          {
                            key: 'delete',
                            label: 'Xóa checklist',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => remove(name),
                          },
                        ],
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        style={{
                          width: '24px',
                          height: '24px',
                          minWidth: '24px',
                          color: '#64748b',
                        }}
                      />
                    </Dropdown>
                  </div>

                  {/* Checklist Items */}
                  {!form.getFieldValue(['checklist', checklistIndex, 'collapsed']) && (
                    <div style={{ padding: '8px 12px' }}>
                      <Form.List name={[name, 'items']}>
                        {(itemFields, { add: addItem, remove: removeItem }) => (
                          <>
                            {itemFields.map(({ key: itemKey, name: itemName }) => (
                              <div
                                key={itemKey}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  marginBottom: 6,
                                  padding: '4px 0',
                                }}
                              >
                                {/* Checkbox */}
                                <Form.Item
                                  name={[itemName, 'completed']}
                                  valuePropName="checked"
                                  style={{ margin: 0 }}
                                >
                                  <Checkbox />
                                </Form.Item>

                                {/* Item Text */}
                                <Form.Item name={[itemName, 'text']} style={{ margin: 0, flex: 1 }}>
                                  <Input
                                    placeholder="Nhập nhiệm vụ..."
                                    variant="borderless"
                                    size="small"
                                    style={{ fontSize: '13px' }}
                                    onPressEnter={e => {
                                      const target = e.target as HTMLInputElement;
                                      const currentText = target.value.trim();
                                      if (currentText) {
                                        // Kiểm tra xem đã có item trống chưa
                                        const allItems =
                                          form.getFieldValue([
                                            'checklist',
                                            checklistIndex,
                                            'items',
                                          ]) || [];
                                        const hasEmptyItem = allItems.some(
                                          (item: any) => !item?.text?.trim(),
                                        );

                                        // Chỉ thêm item mới nếu chưa có item trống
                                        if (!hasEmptyItem) {
                                          addItem({
                                            text: '',
                                            completed: false,
                                            assignee: null,
                                          });
                                          // Focus vào item mới sau khi thêm
                                          setTimeout(() => {
                                            const newItemInput = document.querySelector(
                                              `[name="checklist_${checklistIndex}_items_${itemFields.length}_text"]`,
                                            ) as HTMLInputElement;
                                            if (newItemInput) newItemInput.focus();
                                          }, 50);
                                        }
                                      }
                                    }}
                                    onBlur={e => {
                                      const target = e.target as HTMLInputElement;
                                      const currentText = target.value.trim();
                                      // Xóa item nếu trống và không phải item duy nhất
                                      if (!currentText && itemFields.length > 1) {
                                        removeItem(itemName);
                                      }
                                    }}
                                  />
                                </Form.Item>

                                {/* Assignee */}
                                <Form.Item
                                  name={[itemName, 'assignee']}
                                  style={{ margin: 0, minWidth: '120px' }}
                                >
                                  <Select
                                    placeholder="Người thực hiện"
                                    variant="borderless"
                                    size="small"
                                    style={{ fontSize: '12px' }}
                                    allowClear
                                  >
                                    {users.map((user: IUser) => (
                                      <Option key={user.id} value={user.id}>
                                        {user.name}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>

                                {/* Delete Item Button */}
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<CloseOutlined />}
                                  onClick={() => removeItem(itemName)}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    minWidth: '20px',
                                    color: 'red',
                                    fontSize: '10px',
                                  }}
                                />
                              </div>
                            ))}

                            {/* Add Item Button */}
                            <Button
                              type="text"
                              size="small"
                              onClick={() => {
                                // Kiểm tra xem đã có item trống chưa
                                const allItems =
                                  form.getFieldValue(['checklist', checklistIndex, 'items']) || [];
                                const hasEmptyItem = allItems.some(
                                  (item: any) => !item?.text?.trim(),
                                );

                                // Chỉ thêm item mới nếu chưa có item trống
                                if (!hasEmptyItem) {
                                  addItem({ text: '', completed: false, assignee: null });
                                }
                              }}
                              style={{
                                color: '#1890ff',
                                fontSize: '12px',
                                height: '28px',
                                padding: '0 8px',
                                marginTop: 4,
                              }}
                            >
                              + Thêm nhiệm vụ
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </div>
                  )}
                </div>
              ))}

              {/* Empty State */}
              {fields.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    color: '#9ca3af',
                    fontSize: '14px',
                    background: '#fafbfc',
                    borderRadius: 6,
                    border: '1px dashed #e2e8f0',
                  }}
                >
                  <div>Chưa có checklist nào</div>
                </div>
              )}
            </>
          )}
        </Form.List>
      </div>
    </div>
  );
};

export default Checklists;
