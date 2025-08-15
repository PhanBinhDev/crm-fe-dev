import { Route } from 'react-router-dom';
import { ActivitiesKanbanPage } from './list';
import { ActivitiesCreatePage } from './create';
import { ActivitiesEditPage } from './edit';
import { ActivitiesShowPage } from './show';

export const activitiesRoutes = [
  <Route path="/workspaces" element={<ActivitiesKanbanPage />} />,
  <Route path="/workspaces/create" element={<ActivitiesCreatePage />} />,
  <Route path="/workspaces/edit/:id" element={<ActivitiesEditPage />} />,
  <Route path="/workspaces/show/:id" element={<ActivitiesShowPage />} />,
];
