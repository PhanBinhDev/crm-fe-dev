import { PlusOutlined } from '@ant-design/icons';
import { useCreate } from '@refinedev/core';
import { Button, Form, Input, Radio, Typography, Upload, message } from 'antd';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const questions = [
  'Câu hỏi 1: Nội dung bài giảng có rõ ràng không?',
  'Câu hỏi 2: Thầy/Cô có giảng dễ hiểu không?',
  'Câu hỏi 3: Bài tập và tài liệu có hữu ích không?',
  'Câu hỏi 4: Thời lượng buổi học có hợp lý không?',
  'Câu hỏi 5: Bạn có hài lòng tổng thể không?',
];

const options = [
  { label: 'Rất tốt', value: 5 },
  { label: 'Tốt', value: 4 },
  { label: 'Bình thường', value: 3 },
  { label: 'Tệ', value: 2 },
  { label: 'Rất tệ', value: 1 },
];

const FeedbackForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();

  const { mutate: createFeedback, isPending: isPendingCreateFeedback } = useCreate({
    mutationOptions: {
      retry: false,
    },
  });

  const onFinish = (values: any) => {
    const { fullname, email, studentId, numPhone, comments, images, ...answers } = values;

    const ratings = Object.values(answers) as number[];
    const avgRating = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;

    const payload = {
      fullName: fullname,
      email,
      studentId,
      numPhone,
      comments,
      rating: String(avgRating),
      images: images?.map((file: any) => ({
        uid: file.uid,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.originFileObj?.lastModified,
        originFileObj: file.originFileObj,
      })),
    };

    createFeedback(
      {
        resource: `activities/${id}/event-feedback`,
        values: payload,
      },
      {
        onSuccess: () => {
          message.success('TGửi phản hồi thành công!');
        },
        onError: () => {
          message.error('Gửi phản hồi thất bại. Vui lòng thử lại sau.');
        },
      },
    );
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '40px auto',
        padding: 24,
        boxShadow: '1px 1px 50px 4px #e4dfdf',
        borderRadius: '20px',
      }}
    >
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        Phiếu Đánh Giá
      </Typography.Title>
      <Typography.Title level={3} style={{ textAlign: 'left' }}>
        Sự kiện
      </Typography.Title>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{}}>
        {/* Thông tin sinh viên */}
        <Form.Item
          label="Tên sinh viên"
          name="fullname"
          rules={[
            { required: true, message: 'Vui lòng nhập tên sinh viên' },
            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
            { max: 50, message: 'Tên không được quá 50 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên sinh viên" />
        </Form.Item>

        <Form.Item
          label="Email sinh viên"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email sinh viên' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email sinh viên" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại sinh viên"
          name="numPhone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại sinh viên' },
            {
              pattern: /^[0-9]{10,11}$/,
              message: 'Số điện thoại không hợp lệ',
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại sinh viên" />
        </Form.Item>

        <Form.Item
          label="Mã số sinh viên"
          name="studentId"
          rules={[
            { required: true, message: 'Vui lòng nhập MSSV' },
            {
              pattern: /^[A-Za-z0-9]+$/,
              message: 'MSSV chỉ được chứa chữ và số',
            },
            { min: 7, message: 'MSSV phải có ít nhất 7 ký tự' },
          ]}
        >
          <Input placeholder="Nhập mã số sinh viên" />
        </Form.Item>

        {/* 5 câu hỏi */}
        {questions.map((q, index) => (
          <Form.Item
            key={index}
            label={q}
            name={`question${index + 1}`}
            rules={[{ required: true, message: 'Vui lòng chọn câu trả lời' }]}
          >
            <Radio.Group options={options} optionType="default" buttonStyle="solid" />
          </Form.Item>
        ))}

        {/* Góp ý */}
        <Form.Item label="Góp ý thêm" name="comments">
          <TextArea rows={4} placeholder="Nhập góp ý của bạn (nếu có)" />
        </Form.Item>

        {/* Upload ảnh */}
        <Form.Item
          label="Hình ảnh minh họa"
          name="images"
          valuePropName="fileList"
          getValueFromEvent={e => e?.fileList}
        >
          <Upload listType="picture-card" beforeUpload={() => false} accept="image/*">
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPendingCreateFeedback}>
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FeedbackForm;
