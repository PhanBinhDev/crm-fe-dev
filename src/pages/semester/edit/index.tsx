import SemesterForm from '@/pages/semester/components/form';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';
import { useForm } from '@refinedev/antd';

const SemesterEditPage = () => {
  const { id } = useParams();
  const { formProps } = useForm({ resource: 'semesters', id });
  return (
    <Card title="Chỉnh sửa kỳ học" style={{ maxWidth: 600, margin: '32px auto' }}>
      <SemesterForm {...formProps} />
    </Card>
  );
};

export default SemesterEditPage;
