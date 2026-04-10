import { BrowserRouter,Routes, Route } from "react-router-dom";

import Home from "./pages/Auth/Home";
import Login from "./pages/Auth/LoginNew";
import LoginWithNavigate from './pages/Auth/LoginWithNavigate';
import SignUp from "./pages/Auth/SignUpNew";
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
