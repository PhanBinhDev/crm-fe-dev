import { Route } from 'react-router-dom';
import { ActivitiesKanbanPage } from './kanban';
import { ActivitiesListPage } from './list';
import { ActivitiesCreatePage } from './create';
import { ActivitiesEditPage } from './edit';
import { ActivitiesShowPage } from './show';

export const activitiesRoutes = [
  <Route path="/activities" element={<ActivitiesKanbanPage />} />,
  <Route path="/activities/list" element={<ActivitiesListPage />} />,
  <Route path="/activities/create" element={<ActivitiesCreatePage />} />,
  <Route path="/activities/edit/:id" element={<ActivitiesEditPage />} />,
  <Route path="/activities/show/:id" element={<ActivitiesShowPage />} />,
];
