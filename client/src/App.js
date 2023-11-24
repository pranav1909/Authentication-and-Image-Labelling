import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import './App.css';
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const user = useSelector((state) => state.authReducer.authData?.email);
  const isAdmin = useSelector((state) => state.authReducer.authData?.isAdmin);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? (isAdmin ? <AdminDashboard /> : <Home />) : <Navigate to="/auth" />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="*"
        element={<Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
