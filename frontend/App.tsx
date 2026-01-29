
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import Dashboard from './pages/shared/Dashboard';
import RaiseIssue from './pages/student/RaiseIssue';
import MyIssues from './pages/student/MyIssues';
import IssueDetail from './pages/shared/IssueDetail';
import Announcements from './pages/shared/Announcements';
import Opportunities from './pages/shared/Opportunities';
import UserManagement from './pages/admin/UserManagement';
import OpportunitiesManagement from './pages/admin/OpportunitiesManagement';
import ManageIssues from './pages/admin/ManageIssues';
import CommunityChat from './pages/shared/CommunityChat';
import Settings from './pages/shared/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'STUDENT' | 'ADMIN' }> = ({ children, allowedRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    if (window.location.hash.includes('/admin') || allowedRole === 'ADMIN') {
      return <Navigate to="/admin/login" />;
    }
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-blue-50">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AppLayout><CommunityChat /></AppLayout></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><AppLayout><Announcements /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/issues/:id" element={<ProtectedRoute><AppLayout><IssueDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/my-issues" element={<ProtectedRoute><AppLayout><MyIssues /></AppLayout></ProtectedRoute>} />

            {/* Student Only */}
            <Route path="/raise-issue" element={<ProtectedRoute allowedRole="STUDENT"><AppLayout><RaiseIssue /></AppLayout></ProtectedRoute>} />
            <Route path="/opportunities" element={<ProtectedRoute allowedRole="STUDENT"><AppLayout><Opportunities /></AppLayout></ProtectedRoute>} />

            {/* Admin Only */}
            <Route path="/users" element={<ProtectedRoute allowedRole="ADMIN"><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/opportunities" element={<ProtectedRoute allowedRole="ADMIN"><AppLayout><OpportunitiesManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/manage-issues" element={<ProtectedRoute allowedRole="ADMIN"><AppLayout><ManageIssues /></AppLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
