import SettingsPage from '@/pages/settings';
import { Navigate, Route } from 'react-router-dom';
import GeneralSettings from './components/tabs/GeneralSettings';
import NotificationsSettings from './components/tabs/NotificationsSettings';
import WorkspacesSettings from './components/tabs/WorkspacesSettings';
import ManageWorkspace from './components/workspaces/ManageWorkspace';

export const settingsRoutes = [
  <Route path="/settings" element={<SettingsPage />}>
    <Route index element={<Navigate to="/settings/general" />} />
    <Route path="general" element={<GeneralSettings />} />
    <Route path="workspaces" element={<WorkspacesSettings />} />
    <Route path="notifications" element={<NotificationsSettings />} />
    <Route path="workspaces/:workspaceId" element={<ManageWorkspace />} />
  </Route>,
];
