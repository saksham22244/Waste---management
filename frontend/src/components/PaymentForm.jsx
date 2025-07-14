import React from "react";
import axios from "axios";
import { generateUniqueId } from "esewajs";

const PaymentForm = () => {
    const handlePayment = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/initiate-payment`, {
                amount: 100,
                productId: generateUniqueId(),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            window.location.href = response.data.url;
        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("Failed to initiate payment. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-green-600">
                    eSewa Payment
                </h1>

                <form onSubmit={handlePayment} className="space-y-6">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-700 mb-4">
                            Fixed Payment Amount: Rs. 100
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                    >
                        Pay with eSewa
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
