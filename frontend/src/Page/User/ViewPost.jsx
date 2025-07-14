import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const ViewPost = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <div className="p-6 bg-white m-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-6">
                        <Button
                            onClick={() => navigate('/userHome')}
                            className="mr-4 bg-green-500 hover:bg-green-600"
                        >
                            <ChevronLeft size={24} />
                            BACK
                        </Button>
                    </div>

                    <h1 className="text-4xl font-bold text-center mb-10">Recyclable Waste</h1>

                    <div className="flex flex-col items-center mb-10">
                        <img
                            src="/lovable-uploads/25535270-84dd-47a1-9e1b-f777456ff5b0.png"
                            alt="Recycling bins"
                            className="w-full max-w-lg rounded-md mb-8"
                        />

                        <div className="max-w-3xl text-lg">
                            <p className="mb-6">
                                Recyclable materials include many kinds of glass, paper, cardboard, metal, plastic, tires, textiles, batteries, and electronics. The composting and other reuse of biodegradable waste—such as food and garden waste—is also a form of recycling.
                            </p>

                            <h2 className="text-2xl font-bold mb-4">Benefits of Recycling</h2>
                            <ul className="list-disc pl-6 space-y-2 mb-6">
                                <li>Reduces the amount of waste sent to landfills</li>
                                <li>Conserves natural resources such as timber, water, and minerals</li>
                                <li>Prevents pollution by reducing the need to collect new raw materials</li>
                                <li>Saves energy and reduces greenhouse gas emissions</li>
                                <li>Creates jobs in the recycling and manufacturing industries</li>
                            </ul>

                            <h2 className="text-2xl font-bold mb-4">How to Recycle Properly</h2>
                            <p className="mb-4">To ensure effective recycling:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Clean containers before recycling</li>
                                <li>Separate different types of recyclables</li>
                                <li>Follow local recycling guidelines</li>
                                <li>Avoid wishful recycling - only recycle items that are truly recyclable</li>
                                <li>Consider composting food and garden waste</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPost;