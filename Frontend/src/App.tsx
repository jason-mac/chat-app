import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import Home from './pages/Home';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
