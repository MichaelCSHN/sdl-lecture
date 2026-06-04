import { createBrowserRouter } from 'react-router';
import AppShell from '@/layouts/AppShell';
import HomePage from '@/pages/HomePage';
import CoursePage from '@/pages/CoursePage';
import FoundationsPage from '@/pages/FoundationsPage';
import ALabPage from '@/pages/ALabPage';
import CaseStudioPage from '@/pages/CaseStudioPage';
import MethodsPage from '@/pages/MethodsPage';
import DesignStudioPage from '@/pages/DesignStudioPage';
import ResourcesPage from '@/pages/ResourcesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'course', element: <CoursePage /> },
      { path: 'foundations', element: <FoundationsPage /> },
      { path: 'a-lab', element: <ALabPage /> },
      { path: 'case-studio', element: <CaseStudioPage /> },
      { path: 'methods', element: <MethodsPage /> },
      { path: 'design-studio', element: <DesignStudioPage /> },
      { path: 'resources', element: <ResourcesPage /> },
    ],
  },
]);
