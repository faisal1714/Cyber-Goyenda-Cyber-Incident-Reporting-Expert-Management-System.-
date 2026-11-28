import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SubmitIncident from './pages/SubmitIncident.jsx';
import IncidentResult from './pages/IncidentResult.jsx';
import RequestExpert from './pages/RequestExpert.jsx';
import MyIncidents from './pages/MyIncidents.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/request-expert" element={<RequestExpert />} />

        <Route
          path="/submit-incident"
          element={
            <ProtectedRoute>
              <SubmitIncident />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-incidents"
          element={
            <ProtectedRoute>
              <MyIncidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incident-result/:id"
          element={
            <ProtectedRoute>
              <IncidentResult />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
