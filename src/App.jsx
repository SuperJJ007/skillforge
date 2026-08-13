import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DisciplinePage from './pages/DisciplinePage';
import ToolDetailPage from './pages/ToolDetailPage';
import LoginPage from './pages/LoginPage';
import SubmitPage from './pages/SubmitPage';
import AuthorPage from './pages/AuthorPage';
import PlannerPage from './pages/PlannerPage';
import BenchPage from './pages/BenchPage';
import AdminReviewPage from './pages/AdminReviewPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discipline/:id" element={<DisciplinePage />} />
          <Route path="/tool/:id" element={<ToolDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/author/:id" element={<AuthorPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/bench" element={<BenchPage />} />
          <Route path="/admin/review" element={<AdminReviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
