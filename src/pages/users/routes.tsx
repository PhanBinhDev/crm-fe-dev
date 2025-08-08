import { UserList, UserCreate, UserEdit, UserShow } from '@/pages/users';
import { Route } from 'react-router-dom';

export const userRoutes = [
  <Route key="users-list" path="/users" element={<UserList />} />,
  <Route key="users-create" path="/users/create" element={<UserCreate />} />,
  <Route key="users-edit" path="/users/edit/:id" element={<UserEdit />} />,
  <Route key="users-show" path="/users/show/:id" element={<UserShow />} />,
];
