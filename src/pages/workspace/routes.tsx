import { Route } from 'react-router-dom';
import KanbanWorkspaces from './kanban';

export const workspaceRoutes = [<Route path="/workspaces" element={<KanbanWorkspaces />} />];
