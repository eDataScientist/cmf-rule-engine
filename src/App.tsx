import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/shared/Layout/AppLayout';
import { ThemeProvider } from '@/components/shared/ThemeProvider';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const ReviewTrees = lazy(() => import('@/pages/review-trees'));
const GenerateTree = lazy(() => import('@/pages/generate-tree'));
const TableVisualizer = lazy(() => import('@/pages/table-visualizer'));
const TreeVisualizer = lazy(() => import('@/pages/tree-visualizer'));

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/review-trees" replace />} />
              <Route path="/review-trees" element={<ReviewTrees />} />
              <Route path="/generate-tree" element={<GenerateTree />} />
              <Route path="/table-visualizer" element={<TableVisualizer />} />
              <Route path="/tree-visualizer/:treeId" element={<TreeVisualizer />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
