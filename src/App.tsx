import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/shared/Layout/AppLayout';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

const ReviewTrees = lazy(() => import('@/pages/review-trees'));
const GenerateTree = lazy(() => import('@/pages/generate-tree'));
const VisualizeTrace = lazy(() => import('@/pages/visualize-trace'));
const TableVisualizer = lazy(() => import('@/pages/table-visualizer'));

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/review-trees" replace />} />
            <Route path="/review-trees" element={<ReviewTrees />} />
            <Route path="/generate-tree" element={<GenerateTree />} />
            <Route path="/visualize-trace" element={<VisualizeTrace />} />
            <Route path="/table-visualizer" element={<TableVisualizer />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
