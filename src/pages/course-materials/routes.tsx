import { Navigate, Route } from 'react-router-dom';
import ExamBank from './exam-bank/ExamBank';
import ExamFolderDetail from './exam-bank/ExamFolderDetail';
import MaterialsList from './list';

export const materialRoutes = [
  <Route path="/materials" element={<Navigate to="/materials/list" />} />,
  <Route path="/materials/list" element={<MaterialsList />} />,

  <Route path="/exams/bank" element={<ExamBank />} />,
  <Route path="/exams/bank/:folderId" element={<ExamFolderDetail />} />,
];
