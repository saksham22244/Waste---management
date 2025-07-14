import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base64Decode } from "esewajs";
import axios from "axios";

const Success = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("data");
    const decoded = base64Decode(token);

    const verifyPaymentAndUpdateStatus = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payment-status`, {
                product_id: decoded.transaction_uuid,
            });

            if (response.status === 200) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate("/schedule/new");
                }, 1500);
            }
        } catch (error) {
            console.error("Error confirming payment:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        verifyPaymentAndUpdateStatus();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (!isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-600 px-4">
                <h1 className="text-2xl font-bold mb-2">Oops! Payment Verification Failed</h1>
                <p className="mb-6">We encountered an error confirming your payment. Please try again later.</p>
                <button
                    onClick={() => navigate("/schedule/after-payment")}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-50 text-green-700 px-4">
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="mb-6 text-center">Thank you for your payment. Your transaction was successful.</p>
            <p className="text-sm text-gray-600 mb-4">Redirecting you to confirm your schedule...</p>
            <div className="loader"></div>
        </div>
    );
};

export default Success;
