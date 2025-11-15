import { Authenticated, Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from '@refinedev/react-router-v6';
import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { GoogleLoginPage } from '@/components/auth/GoogleLoginPage';
import { CustomLayout } from '@/components/layout/custom-layout';
import { queryClient } from '@/config/queryClient';
import { resources } from '@/config/resources';
import { antdTheme } from '@/config/theme';
import { API_URL } from '@/constants';
import ExamSharePublic from '@/pages/course-materials/exam-bank/ExamSharePublic';
import { profileRoutes } from '@/pages/profile/routes';
import { semesterRoutes } from '@/pages/semester/routes';
import { userRoutes } from '@/pages/users/routes';
import { authProvider } from '@/providers/AuthProvider';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { ErrorComponent } from './components/common/ErrorBoundary';
import { Modals, ModalsDelays } from './components/modals';
import { NotificationHandler } from './components/shared/NotificationHandler';
import { DisplayConfigProvider } from './contexts/DisplayConfig';
import { materialRoutes } from './pages/course-materials/routes';
import { DashboardPage } from './pages/dashboard';
import FeedbackForm from './pages/feedback/FeebackForm';
import InviteWorkspace from './pages/invite/page';
import { settingsRoutes } from './pages/settings/routes';
import { workspaceRoutes } from './pages/workspace/routes';
import { AccessControlProviderCustom } from './providers/AccessControlProviderCustom';
import { standardDataProvider } from './providers/nestjs/standardProvider';

function App() {
  const dataProvider = standardDataProvider(API_URL);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RefineKbarProvider>
          <ConfigProvider locale={viVN} theme={antdTheme}>
            <AntdApp>
              <DisplayConfigProvider>
                <Refine
                  dataProvider={dataProvider}
                  authProvider={authProvider}
                  accessControlProvider={AccessControlProviderCustom}
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
                            retry: 1,
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
                            <NotificationHandler />
                            <Outlet />
                          </CustomLayout>
                        </Authenticated>
                      }
                    >
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      {userRoutes}
                      {workspaceRoutes}
                      {profileRoutes}
                      {semesterRoutes}
                      {materialRoutes}
                      {settingsRoutes}
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                    <Route element={<GoogleLoginPage />} path="/login" />
                    <Route element={<FeedbackForm />} path="/feedback-event/:id" />
                    <Route element={<ExamSharePublic />} path="/exam-public/*" />
                    <Route path="/invite-members/:token" element={<InviteWorkspace />} />,
                  </Routes>

                  <Modals />
                  <ModalsDelays />
                  <RefineKbar />
                  <Toaster position="top-right" />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
              </DisplayConfigProvider>
            </AntdApp>
          </ConfigProvider>
        </RefineKbarProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
