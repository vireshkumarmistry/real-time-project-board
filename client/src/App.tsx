import { useSelector } from "./store";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectsPage from "./pages/ProjectsPage";
import Navbar from "./components/Navbar";

function App() {
  const { user } = useSelector((state) => state.auth);
  console.log("🚀 ~ App ~ user:", user);

  return (
    <>
      <Router>
        <Navbar />
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
      </Router>
    </>
  );
}

export default App;
