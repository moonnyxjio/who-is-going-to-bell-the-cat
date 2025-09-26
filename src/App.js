import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Exam from "./pages/Exam";
import Records from "./pages/Records";
import Badges from "./pages/Badges";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn/:day" element={<Learn />} />
        <Route path="/exam/:day" element={<Exam />} />
        <Route path="/records" element={<Records />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/admin" element={<AdminLogin />} />
      </Routes>
    </div>
  );
}

export default App;
