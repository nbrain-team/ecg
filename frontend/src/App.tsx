import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import HotelLogin from './pages/HotelLogin';
import HotelPortal from './pages/HotelPortal';
import Dashboard from './pages/Dashboard';
import ProposalBuilder from './pages/ProposalBuilder';
import ProposalView from './pages/ProposalView';
import PublicProposal from './pages/PublicProposal';
import PublicProposalModern from './pages/PublicProposalModern';
import BudgetEditor from './pages/BudgetEditor';
import ChatbotProposal from './pages/ChatbotProposal';
import HotelQuoteChat from './pages/HotelQuoteChat';
import HotelQuoteGrid from './pages/HotelQuoteGrid';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHotelAuthenticated, setIsHotelAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    const hotelToken = localStorage.getItem('hotelToken');
    setIsHotelAuthenticated(!!hotelToken);
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleHotelLogin = (token: string) => {
    localStorage.setItem('hotelToken', token);
    setIsHotelAuthenticated(true);
  };

  const handleHotelLogout = () => {
    localStorage.removeItem('hotelToken');
    setIsHotelAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/hotel/login" 
          element={
            isHotelAuthenticated ? 
              <Navigate to="/hotel/portal" /> : 
              <HotelLogin onLogin={handleHotelLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
              <Dashboard onLogout={handleLogout} /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/hotel/portal" 
          element={
            isHotelAuthenticated ? 
              <HotelPortal /> : 
              <Navigate to="/hotel/login" />
          } 
        />
        <Route 
          path="/hotel/ai-quote" 
          element={
            isHotelAuthenticated ? 
              <HotelQuoteChat /> : 
              <Navigate to="/hotel/login" />
          }
        />
        <Route 
          path="/hotel/ai-quote/grid" 
          element={
            isHotelAuthenticated ? 
              <HotelQuoteGrid /> : 
              <Navigate to="/hotel/login" />
          }
        />
                <Route 
          path="/proposal/new" 
          element={
            isAuthenticated ? 
              <ProposalBuilder /> : 
              <Navigate to="/login" />
          }
        />
        <Route 
          path="/proposal/chat" 
          element={
            isAuthenticated ? 
              <ChatbotProposal /> : 
              <Navigate to="/login" />
          }
        />
        <Route 
          path="/proposal/share/:shareId" 
          element={<PublicProposalModern />} 
        />
        <Route 
          path="/budget-editor" 
          element={<BudgetEditor />} 
        />
        <Route 
          path="/proposal/:id" 
          element={
            isAuthenticated ? 
              <ProposalView /> : 
              <Navigate to="/login" />
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
