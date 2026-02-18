import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Home from "./pages/Home";
import Schemes from "./pages/Schemes";
import Transactions from "./pages/Transactions";
import Enroll from "./pages/Enroll";
import PersonalInfo from "./pages/PersonalInfo";
import ProfileEdit from "./pages/ProfileEdit";
import Review from "./pages/Review";
import Bond from "./pages/Bond";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth - no header */}
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<Otp />} />

        {/* Main app - shared header on all these pages */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
        </Route>

        {/* Wizard / flow pages - no main nav header */}
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/personal-info" element={<PersonalInfo />} />
        <Route path="/review" element={<Review />} />
        <Route path="/bond" element={<Bond />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
