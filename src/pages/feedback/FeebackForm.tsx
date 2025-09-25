import { LoadingPage } from '@/components/common';
import { useOne } from '@refinedev/core';
import { Button, Form, Input, Radio, Typography, message } from 'antd';
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
  console.log(id);

  const {
    data: eventInfo,
    isLoading,
    isError,
  } = useOne({ resource: 'activities', id: '3e6a9b83-ec1c-4495-9e81-4fae85fa1bb7' });

  const onFinish = (values: any) => {
    const { studentName, studentId, comments, ...answers } = values;

    const ratings = Object.values(answers) as number[];
    const avgRating = ratings.reduce((acc, val) => acc + val, 0) / ratings.length;

    const payload = {
      studentName,
      studentId,
      comments,
      rating: avgRating,
      answers,
    };

    console.log('Submit data:', payload);

    message.success('Gửi phản hồi thành công!');
  };

  if (isLoading) return <LoadingPage />;

  if (isError) return <div>Có lỗi sảy ra, vui lòng thử lại sau</div>;

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
        Sự kiện: {eventInfo?.data.name}
      </Typography.Title>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{}}>
        {/* Thông tin sinh viên */}
        <Form.Item
          label="Tên sinh viên"
          name="studentName"
          rules={[{ required: true, message: 'Vui lòng nhập tên sinh viên' }]}
        >
          <Input placeholder="Nhập tên sinh viên" />
        </Form.Item>

        <Form.Item
          label="Mã số sinh viên"
          name="studentId"
          rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}
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

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FeedbackForm;
