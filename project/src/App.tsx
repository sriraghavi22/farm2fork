import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import CropDetails from "./components/CropDetails";

// Lazy loading components
const Home = lazy(() => import("./Home"));
const LoginSignup = lazy(() => import("./LoginSinup"));
const FarmerQuestions = lazy(() => import("./FarmerQuestions"));
const DistributorQuestions = lazy(() => import("./DistributorQuestions"));
const DistributorDashboard = lazy(() => import("./DistributorDashBoard"));
const ShopkeeperDashboard = lazy(() => import("./ShopkeeperDashBoard"));
const FarmerDashboard = lazy(() => import("./FarmerDashboard"));
const FarmerCertificate = lazy(() => import("./FarmerCertificate"));
const CropDetails = lazy(() => import("./components/CropDetails"));
// const CropDetails = lazy(() => import("./components/CropDetails"));
const Distributors = lazy(() => import("./components/Distributors"));
const ConsumerPage = lazy(() => import("./ConsumerPage"));

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/FarmerQuestions" element={<FarmerQuestions />} />
        <Route path="/FarmerDashboard" element={<FarmerDashboard />} /> {/* Ensure the casing matches */}
        <Route path="/FarmerCertificate" element={<FarmerCertificate />} /> {/* Ensure the casing matches */}
        <Route path="/DistributorQuestions" element={<DistributorQuestions />} />
        <Route path="/DistributorDashboard" element={<DistributorDashboard />} />
        <Route path="/ShopkeeperDashboard" element={<ShopkeeperDashboard />} />
        <Route path="/CropDetails" element={<CropDetails />} />
        <Route path="/Distributors" element={<Distributors />} />
        <Route path="/consumer" element={<ConsumerPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
