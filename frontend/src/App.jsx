import { Route, Routes } from "react-router-dom";
import FaqPage from "./pages/FaqPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import HowToUsePage from "./pages/HowToUsePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/how-to" element={<HowToUsePage />} />
      <Route path="/faq" element={<FaqPage />} />
    </Routes>
  );
}
