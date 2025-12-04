import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import 'leaflet/dist/leaflet.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import HomePage from './pages/HomePage.jsx';
import SearchResultPage from './pages/SearchResultPage.jsx';
import RoomDetailPage from './pages/RoomDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ManagementLayout from './components/ManagementLayout.jsx';
import RoomManagementPage from './pages/RoomManagementPage.jsx';
import SurveyQuestionsPage from './pages/SurveyQuestionsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "search",
        element: <SearchResultPage />
      },
      {
        path: "rooms/:id",
        element: <RoomDetailPage />
      },
    ]
  },
  {
    path: "/management/login",
    element: <LoginPage />
  },
  {
    path: "/management",
    element: (
      <ProtectedRoute>
        <ManagementLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "rooms",
        element: <RoomManagementPage />
      },
      {
        path: "surveys",
        element: <SurveyQuestionsPage />
      },
    ]
  },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
