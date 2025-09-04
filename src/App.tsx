import { Authenticated, Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router-v6';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import 'react-day-picker/style.css';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { GoogleLoginPage } from '@/components/auth/GoogleLoginPage';
import { CustomLayout } from '@/components/layout/custom-layout';
import { queryClient } from '@/config/queryClient';
import { resources } from '@/config/resources';
import { antdTheme } from '@/config/theme';
import { API_URL } from '@/constants';
import { profileRoutes } from '@/pages/profile/routes';
import { semesterRoutes } from '@/pages/semester/routes';
import { userRoutes } from '@/pages/users/routes';
import { authProvider } from '@/providers/AuthProvider';
import { standardDataProvider } from '@/providers/nestjs';
import '@/styles/globals.css';
import { ErrorComponent } from './components/common/ErrorBoundary';
import Modals from './components/modals';
import { WorkspaceProvider } from './contexts/workspaces';
import { workspaceRoutes } from './pages/workspace/routes';
import { ActivitiesKanbanPage } from './pages/workspaces/list';
import { accessControlProvider } from './providers/accessControlProvider';

function App() {
  const dataProvider = standardDataProvider(API_URL);

  return (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>
        <BrowserRouter>
          <RefineKbarProvider>
            <ConfigProvider locale={viVN} theme={antdTheme}>
              <AntdApp>
                <Refine
                  dataProvider={dataProvider}
                  authProvider={authProvider}
                  accessControlProvider={accessControlProvider}
                  routerProvider={routerBindings}
                  resources={resources}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    reactQuery: {
                      clientConfig: {
                        defaultOptions: {
                          queries: {
                            staleTime: 1000 * 60 * 5,
                            cacheTime: 1000 * 60 * 10,
                            retry: 2,
                            refetchOnWindowFocus: false,
                          },
                          mutations: {
                            retry: 1,
                            cacheTime: 0,
                          },
                        },
                      },
                    },
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <Authenticated key="auth" fallback={<Navigate to="/login" replace />}>
                          <CustomLayout>
                            <Outlet />
                          </CustomLayout>
                        </Authenticated>
                      }
                    >
                      <Route index element={<NavigateToResource resource="dashboard" />} />
                      <Route path="/dashboard" element={<ActivitiesKanbanPage />} />
                      {userRoutes}
                      {/* {activitiesRoutes} */}
                      {workspaceRoutes}
                      {profileRoutes}
                      {semesterRoutes}
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>

                    <Route element={<GoogleLoginPage />} path="/login" />
                  </Routes>

                  <Modals />
                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
              </AntdApp>
            </ConfigProvider>
          </RefineKbarProvider>
        </BrowserRouter>
      </WorkspaceProvider>
    </QueryClientProvider>
  );
}

export default App;
