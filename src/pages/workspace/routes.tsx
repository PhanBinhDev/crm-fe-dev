import { Navigate, Route } from 'react-router-dom';
import RedirectToWorkspace from './components/RedirectToWorkspace';
import KanbanWorkspaces from './kanban';
import SettingsWorkspaces from './settings';
import SettingsMembersWorkspaces from './settings/Member';
import AppearanceSettings from './settings/components/AppearanceSettings';
import GeneralSettings from './settings/components/GeneralSettings';
import SecuritySettings from './settings/components/SecuritySettings';

export const workspaceRoutes = [
  <Route path="/workspaces" element={<RedirectToWorkspace />} />,
  <Route path="/workspaces/:workspaceId" element={<KanbanWorkspaces />} />,
  <Route path="/workspaces/:workspaceId/settings" element={<SettingsWorkspaces />}>
    <Route index element={<Navigate to="general" replace />} />
    <Route path="general" element={<GeneralSettings />} />
    <Route path="security" element={<SecuritySettings />} />
    <Route path="appearance" element={<AppearanceSettings />} />
  </Route>,

  <Route
    path="/workspaces/:workspaceId/settings/members"
    element={<SettingsMembersWorkspaces />}
  />,
];
