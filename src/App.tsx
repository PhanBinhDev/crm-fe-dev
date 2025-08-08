import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { ErrorComponent, useNotificationProvider } from '@refinedev/antd';
import { App as AntdApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router-v6';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { authProvider } from '@/providers/AuthProvider';
import { accessControlProvider } from '@/providers/accessControlProvider';
import { resources } from '@/config/resources';
import { antdTheme } from '@/config/theme';

import { DashboardPage } from '@pages/dashboard';
import { userRoutes } from '@/pages/users/routes';
import { activitiesRoutes } from '@/pages/activities/routes';

import '@/styles/globals.css';
import { CustomLayout } from './components/layout/custom-layout';
import { GoogleLoginPage } from './components/auth/GoogleLoginPage';
import { standardDataProvider } from './providers/nestjs';
import { API_URL } from './constants';

function App() {
  const dataProvider = standardDataProvider(API_URL);

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider locale={viVN} theme={antdTheme}>
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
              }}
            >
              <Routes>
                <Route
                  element={
                    <CustomLayout>
                      <Outlet />
                    </CustomLayout>
                  }
                >
                  <Route index element={<NavigateToResource resource="dashboard" />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  {userRoutes}
                  {activitiesRoutes}
                  <Route path="*" element={<ErrorComponent />} />
                </Route>

                <Route element={<GoogleLoginPage />} path="/login" />
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
