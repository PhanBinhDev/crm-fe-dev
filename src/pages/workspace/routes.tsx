import { Route, Navigate } from 'react-router-dom';
import KanbanWorkspaces from './kanban';
import SettingsWorkspaces from './settings';
import SettingsMembersWorkspaces from './settings/Member';
import GeneralSettings from './settings/components/GeneralSettings';
import SecuritySettings from './settings/components/SecuritySettings';
import AppearanceSettings from './settings/components/AppearanceSettings';

export const workspaceRoutes = [
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
