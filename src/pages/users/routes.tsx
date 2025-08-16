import { UserList, UserCreate, UserEdit, UserShow } from '@/pages/users';
import { Route } from 'react-router-dom';

export const userRoutes = [
  <Route key="users-list" path="/teachers" element={<UserList />} />,
  <Route key="users-create" path="/teachers/create" element={<UserCreate />} />,
  <Route key="users-edit" path="/teachers/edit/:id" element={<UserEdit />} />,
  <Route key="users-show" path="/teachers/show/:id" element={<UserShow />} />,
];
