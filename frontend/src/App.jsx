import React from "react";
import { Route, Routes } from "react-router-dom";
import UserSignup from "./Page/UserSignup";
import GarbageCollectorSignup from "./Page/GarbageCollectorSignup";
import Login from "./Page/Login";
import HomePage from "./Page/User/HomePage";
import SchedulePage from "./Page/User/SchedulePage";
import HistoryPage from "./Page/User/HistoryPage";
import ContactPage from "./Page/User/ContactPage";
import ViewPost from "./Page/User/ViewPost";
import AddPostPage from "./Page/Admin/AddPostPage";
import EditPostPage from "./Page/Admin/EditPostPage";
import NoticePage from "./Page/Admin/NoticePage";
import AdminContact from "./Page/Admin/AdminContactpage";
import RequestPage from "./Page/Admin/Requestpage";
import CollectorHistoryPage from "./Page/Admin/CollectorHistoryPage";
import UsersPage from "./Page/Admin/UsersPage";
import GCHomePage from "./Page/GC/GCHomePage";
import PickUpPage from "./Page/GC/PickUpPage";
import LandingPage from "./Page/LandingPage";
import CollectionForm from "./Page/User/CollectionForm";
import ScheduleAfterPayment from "./Page/User/ScheduleAfterPayment";
import GCHistoryPage from "./Page/GC/GCHistoryPage";
import GCContactPage from "./Page/GC/GCContactPage";
import PaymentForm from "./components/PaymentForm";
import Success from "./components/Success";
import Failure from "./components/Failure";
import OtpVerification from "./Page/OtpVerification";
import ForgotPassword from "./Page/ForgotPassword";
import ResetPassword from "./Page/ResetPassword";
import VerifyResetOTP from "./Page/VerifyResetOTP";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: '20px', // Increase font size
            padding: '10px',  // Add more padding
            minWidth: '225px', // Set a minimum width
            background: '#fff', // Customize background color
            color: '#4caf50',       // Customize text color
            borderRadius: '10px', // Add rounded corners
          },
          success: {
            iconTheme: {
              primary: '#4caf50', // Success icon color
              secondary: '#fff',  // Background color for the icon
            },
          },
          error: {
            iconTheme: {
              primary: '#f44336', // Error icon color
              secondary: '#fff',  // Background color for the icon
            },
          },
        }}
      />
      <Routes>
        {/* Authentication Routes */}
        <Route path="/signup/user" element={<UserSignup />} />
        <Route path="/signup/garbage-collector" element={<GarbageCollectorSignup />} />
        <Route path="/login" element={<Login />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* User Routes */}
        <Route path="/userHome" element={<HomePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/viewPost" element={<ViewPost />} />
        <Route path="/schedule/new" element={<CollectionForm />} />
        <Route path="/schedule/after-payment" element={<ScheduleAfterPayment />} />

        {/* Admin Routes */}
        {/* <Route path="/adminHome" element={<AdminHomePage />} /> */}
        <Route path="/addPost" element={<AddPostPage />} />
        <Route path="/editPost" element={<EditPostPage />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/Requestpage" element={<RequestPage />} />
        <Route path="/GarbageCollectorHistory" element={<CollectorHistoryPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/Admincontact" element={<AdminContact />} />

        {/* Garbage Collector Routes */}
        <Route path="/gcHome" element={<GCHomePage />} />
        <Route path="/pickup" element={<PickUpPage />} />
        <Route path="/gcHistory" element={<GCHistoryPage />} />
        <Route path="/gcContact" element={<GCContactPage />} />

        {/* Payment Routes */}
        <Route path="/payment" element={<PaymentForm />} />
        <Route path="/payment-success" element={<Success />} />
        <Route path="/payment-failure" element={<Failure />} />

        {/* Otp Verification Route */}
        <Route path="/otp-verification" element={<OtpVerification />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />

        {/* 404 Not Found Route */}

      </Routes>


    </div>
  );
}

export default App;
