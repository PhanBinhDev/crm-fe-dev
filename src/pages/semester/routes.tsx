import SemesterListPage from './list';
import SemesterCreatePage from './create';
import SemesterEditPage from './edit';
import SemesterShowPage from './show';
import { Navigate, Route } from 'react-router-dom';

export const semesterRoutes = [
  <Route path="/semesters" element={<Navigate to="/semesters/active" />} />,
  <Route path="/semesters/list" element={<SemesterListPage />} />,
  <Route path="/semesters/create" element={<SemesterCreatePage />} />,
  <Route path="/semesters/:id/edit" element={<SemesterEditPage />} />,
  <Route path="/semesters/:id" element={<SemesterShowPage />} />,
];
