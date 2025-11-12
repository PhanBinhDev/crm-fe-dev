import { Navigate, Route } from 'react-router-dom';
import ExamBank from './exam-bank/ExamBank';
import ExamFolderDetail from './exam-bank/ExamFolderDetail';
import RandomExam from './exam-bank/RandomExam';
import MaterialsList from './list';


export const materialRoutes = [
  <Route path="/materials" element={<Navigate to="/materials/list" />} />,
  <Route path="/materials/list" element={<MaterialsList />} />,

  <Route path="/exams/bank" element={<ExamBank />} />,
  <Route path="/exams/bank/:folderId" element={<ExamFolderDetail />} />,
  <Route path="/exams/random" element={<RandomExam />} />,
  <Route path="/exams/random/result" element={<div>Kết quả random đề thi (UI tạm)</div>} />,
];
