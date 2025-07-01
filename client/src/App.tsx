import { Suspense, lazy } from "react";
import { useSelector } from "./store";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));

function App() {
  const { user } = useSelector((state) => state.auth);
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route
            path="/projects"
            element={user ? <ProjectsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={
              user ? (
                <Navigate to="/projects" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
