import { Route } from 'react-router-dom';
import KanbanWorkspaces from './kanban';
import SettingsWorkspaces from './settings';
import SettingsMembersWorkspaces from './settings/Member';

export const workspaceRoutes = [
  <Route path="/workspaces/:workspaceId" element={<KanbanWorkspaces />} />,
  <Route path="/workspaces/:workspaceId/settings" element={<SettingsWorkspaces />} />,
  <Route
    path="/workspaces/:workspaceId/settings/members"
    element={<SettingsMembersWorkspaces />}
  />,
];
