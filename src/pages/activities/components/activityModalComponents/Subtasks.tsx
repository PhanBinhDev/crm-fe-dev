import { IUser } from '@/common/types';
import { CloseOutlined, PartitionOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import React from 'react';

const { Option } = Select;

const Subtasks: React.FC<any> = ({ users }) => {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Form.List name="subtasks">
          {(fields, { add, remove }) => (
            <>
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
                  <PartitionOutlined style={{ color: '#8c8c8c' }} />
                  Nhiệm vụ con
                  {fields.length > 0 && (
                    <span
                      style={{
                        background: '#e6e9ef',
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
                      assignee: null,
                      priority: 'medium',
                      endDate: '',
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
                  + Tạo nhiệm vụ con
                </Button>
              </div>

              {fields.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 100px 120px 32px',
                    gap: '12px',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '4px 4px 0 0',
                    fontSize: '11px',
                    color: '#202020',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                  }}
                >
                  <div>Tên công việc</div>
                  <div>Đảm nhiệm</div>
                  <div>Ưu tiên</div>
                  <div>Ngày kết thúc</div>
                  <div></div>
                </div>
              )}

              {fields.map(({ key, name }, index) => (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 100px 120px 32px',
                    gap: '12px',
                    padding: '8px 12px',
                    alignItems: 'center',
                    background: '#ffffff',
                    borderLeft: '1px solid #e6e9ef',
                    borderRight: '1px solid #e6e9ef',
                    borderBottom:
                      index === fields.length - 1 ? '1px solid #e6e9ef' : '1px solid #f1f3f4',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '2px',
                        flexShrink: 0,
                      }}
                    />
                    <Form.Item name={[name, 'name']} style={{ margin: 0, flex: 1 }}>
                      <Input
                        placeholder="Tên công việc"
                        variant="borderless"
                        size="small"
                        style={{ fontSize: '13px' }}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item name={[name, 'assignee']} style={{ margin: 0 }}>
                    <Select
                      placeholder="Đảm nhiệm"
                      variant="borderless"
                      size="small"
                      style={{ fontSize: '13px' }}
                    >
                      {users.map((user: IUser) => (
                        <Option key={user.id} value={user.id}>
                          {user.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name={[name, 'priority']} style={{ margin: 0 }}>
                    <Select
                      placeholder="Ưu tiên"
                      variant="borderless"
                      style={{ fontSize: '13px', minWidth: '120px' }}
                      options={[
                        { label: '🔴 Urgent', value: 'urgent' },
                        { label: '🟡 High', value: 'high' },
                        { label: '🔵 Normal', value: 'medium' },
                        { label: '⚪ Low', value: 'low' },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item name={[name, 'endDate']} style={{ margin: 0 }}>
                    <DatePicker
                      showTime
                      placeholder="Ngày kết thúc"
                      style={{ width: '100%' }}
                      variant="borderless"
                      size="small"
                    />
                  </Form.Item>

                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => remove(name)}
                    style={{
                      width: '24px',
                      height: '24px',
                      minWidth: '24px',
                      color: '#dc2626',
                      fontSize: '10px',
                    }}
                  />
                </div>
              ))}

              {fields.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    color: '#9ca3af',
                    fontSize: '14px',
                    background: '#fafbfc',
                    borderRadius: 4,
                    border: '1px dashed #e6e9ef',
                  }}
                >
                  Chưa có nhiệm vụ nào
                </div>
              )}
            </>
          )}
        </Form.List>
      </div>
    </div>
  );
};

export default Subtasks;
