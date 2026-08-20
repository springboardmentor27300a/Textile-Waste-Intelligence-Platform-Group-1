import { BrowserRouter, Routes, Route } from "react-router-dom";

import MaterialRecognition from "./pages/MaterialRecognition";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Dataset from "./pages/Dataset";
import Inventory from "./pages/Inventory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dataset" element={<Dataset />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route
  path="/material-recognition"
  element={<MaterialRecognition />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;