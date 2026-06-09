import { createBrowserRouter, createHashRouter } from 'react-router';
import AppShell from '@/layouts/AppShell';
import HomePage from '@/pages/HomePage';
import CoursePage from '@/pages/CoursePage';
import FoundationsPage from '@/pages/FoundationsPage';
import AIMethodsPage from '@/pages/AIMethodsPage';
import FrontiersPage from '@/pages/FrontiersPage';
import ALabPage from '@/pages/ALabPage';
import CaseStudioPage from '@/pages/CaseStudioPage';
import MethodsPage from '@/pages/MethodsPage';
import DesignStudioPage from '@/pages/DesignStudioPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ParadigmsPage from '@/pages/ParadigmsPage';
import SDLDemoPage from '@/pages/SDLDemoPage';
import LedCalibrationPage from '@/pages/LedCalibrationPage';

const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'course', element: <CoursePage /> },
      { path: 'foundations', element: <FoundationsPage /> },
      { path: 'ai-methods', element: <AIMethodsPage /> },
      { path: 'frontiers', element: <FrontiersPage /> },
      { path: 'paradigms', element: <ParadigmsPage /> },
      { path: 'a-lab', element: <ALabPage /> },
      { path: 'case-studio', element: <CaseStudioPage /> },
      { path: 'sdl-demo', element: <SDLDemoPage /> },
      { path: 'led-calibration', element: <LedCalibrationPage /> },
      { path: 'methods', element: <MethodsPage /> },
      { path: 'design-studio', element: <DesignStudioPage /> },
      { path: 'resources', element: <ResourcesPage /> },
    ],
  },
];

const isGitHubPagesBuild = import.meta.env.MODE === 'github-pages';

export const router = isGitHubPagesBuild
  ? createHashRouter(routes)
  : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });
