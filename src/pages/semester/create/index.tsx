import { Card } from 'antd';
import SemesterForm from '@/pages/semester/components/form';

const SemesterCreatePage = () => (
  <Card title="Tạo kỳ học mới" style={{ maxWidth: 600, margin: '32px auto' }}>
    <SemesterForm />
  </Card>
);

export default SemesterCreatePage;
