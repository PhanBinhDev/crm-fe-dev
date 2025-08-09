import { FileTextOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

const Description = () => {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#202020',
              fontWeight: 500,

              letterSpacing: '0.3px',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <FileTextOutlined style={{ color: '#8c8c8c' }} />
            Mô tả
          </div>
          <Form.Item name="description" style={{ marginBottom: 0, flex: 1 }}>
            <Input.TextArea
              rows={4}
              placeholder="Mô tả chi tiết công việc"
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                border: '1px solid #e6e9ef',
                borderRadius: 6,
              }}
            />
          </Form.Item>
        </div>
      </div>
    </div>
  );
};

export default Description;
