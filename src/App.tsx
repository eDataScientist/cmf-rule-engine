import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/shared/Layout/AppLayout';
import { RoleGuard, getRoleLandingPath } from '@/components/shared/RoleGuard';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { AuthProvider, useAuth, type UserRole } from '@/lib/auth/context';

const AuthPage = lazy(() => import('@/pages/auth'));
const AdminAuthPage = lazy(() => import('@/pages/auth/admin'));
const ReviewTrees = lazy(() => import('@/pages/review-trees'));
const GenerateTree = lazy(() => import('@/pages/generate-tree'));
const TableVisualizer = lazy(() => import('@/pages/table-visualizer'));
const TreeVisualizer = lazy(() => import('@/pages/tree-visualizer'));
const VisualizeTrace = lazy(() => import('@/pages/visualize-trace'));
const Datasets = lazy(() => import('@/pages/datasets'));
const DatasetDetail = lazy(() => import('@/pages/datasets/[id]/index'));
const RuleBuilder = lazy(() => import('@/pages/rule-builder'));
const RuleManager = lazy(() => import('@/pages/rule-manager'));
const AdminDashboard = lazy(() => import('@/pages/admin'));
const AdminCompanies = lazy(() => import('@/pages/admin/companies'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));
const AdminLogs = lazy(() => import('@/pages/admin/logs'));
const CompanyUsers = lazy(() => import('@/pages/company/users'));

const allRoles: UserRole[] = ['admin', 'client_admin', 'client_user'];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function RoleLandingRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !profile || !profile.is_active) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to={getRoleLandingPath(profile.role)} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/admin" element={<AdminAuthPage />} />
              <Route path="/" element={<RoleLandingRedirect />} />

              <Route
                path="/review-trees"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <ReviewTrees />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/generate-tree"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AppLayout>
                      <GenerateTree />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/table-visualizer"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <TableVisualizer />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/tree-visualizer/:treeId"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <TreeVisualizer />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/visualize-trace/:treeId?"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <VisualizeTrace />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/datasets"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <Datasets />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route path="/datasets/upload" element={<Navigate to="/datasets" replace />} />

              <Route
                path="/datasets/:id"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <DatasetDetail />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/rules"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <RuleManager />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/rule-builder/:datasetId?"
                element={
                  <RoleGuard allowedRoles={allRoles}>
                    <AppLayout>
                      <RuleBuilder />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/admin"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/admin/companies"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AppLayout>
                      <AdminCompanies />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AppLayout>
                      <AdminUsers />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/admin/logs"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AppLayout>
                      <AdminLogs />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route
                path="/company/users"
                element={
                  <RoleGuard allowedRoles={['client_admin']}>
                    <AppLayout>
                      <CompanyUsers />
                    </AppLayout>
                  </RoleGuard>
                }
              />

              <Route path="*" element={<RoleLandingRedirect />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
