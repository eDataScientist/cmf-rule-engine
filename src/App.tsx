import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/shared/Layout/AppLayout';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { AuthProvider } from '@/lib/auth/context';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const AuthPage = lazy(() => import('@/pages/auth'));
const ReviewTrees = lazy(() => import('@/pages/review-trees'));
const GenerateTree = lazy(() => import('@/pages/generate-tree'));
const TableVisualizer = lazy(() => import('@/pages/table-visualizer'));
const TreeVisualizer = lazy(() => import('@/pages/tree-visualizer'));
const VisualizeTrace = lazy(() => import('@/pages/visualize-trace'));
const Datasets = lazy(() => import('@/pages/datasets'));
const DatasetDetail = lazy(() => import('@/pages/datasets/[id]/index'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              {/* Public route */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/review-trees" replace />} />
              <Route
                path="/review-trees"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ReviewTrees />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-tree"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GenerateTree />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/table-visualizer"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <TableVisualizer />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tree-visualizer/:treeId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <TreeVisualizer />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visualize-trace/:treeId?"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <VisualizeTrace />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/datasets"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Datasets />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/datasets/upload" element={<Navigate to="/datasets" replace />} />
              <Route
                path="/datasets/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DatasetDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
