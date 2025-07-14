import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Button } from '../../components/ui/button';
import { ArrowRight, CheckCircle, RecycleIcon, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reminders from '@/components/Reminders';

const HomePage = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <div className="p-6">
                    {/* Hero Section */}
                    <section className="mb-16 rounded-2xl bg-gradient-to-r from-green-600 to-green-800 text-white p-8 shadow-lg">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sustainable Waste Management for a Cleaner Future</h1>
                            <p className="text-xl mb-8 text-green-100">Join the green revolution and make a positive impact on our environment by managing your waste efficiently.</p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/schedule/after-payment">
                                    <Button size="lg" className="bg-white text-green-800 hover:bg-green-100">
                                        Schedule a Pickup <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                {/* <Link to="/recyclable-waste">
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                                        Learn More
                                    </Button>
                                </Link> */}
                            </div>
                        </div>
                    </section>

                    {/* Services Section */}
                    <section className="mb-16">
                        <Reminders />
                        {/* <h2 className="text-3xl font-bold mb-8 text-center text-green-800">Our Waste Management Solutions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <RecycleIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">Recycling Services</h3>
                                <p className="text-gray-600">Professional sorting and processing of recyclable materials to minimize environmental impact.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <Truck className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">Waste Collection</h3>
                                <p className="text-gray-600">Scheduled pickups and efficient waste removal services for residential and commercial needs.</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">Waste Auditing</h3>
                                <p className="text-gray-600">Comprehensive waste assessment and consulting to optimize your waste management practices.</p>
                            </div>
                        </div> */}
                    </section>

                    {/* Stats Section */}
                   <section className="mb-16 bg-white rounded-xl shadow-md p-8">
                        <h2 className="text-3xl font-bold mb-8 text-center text-green-800">Important Notice</h2>

                        {/* Important Notice */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md mb-8">
                            <p className="mb-2 font-medium">📞 The garbage collector will call you up to <strong>5 times</strong> to confirm your pickup.</p>
                            <p className="mb-2">❗ If you do not answer these calls, your garbage will <strong>not be collected</strong>, and you will receive a <strong>partial refund</strong>.</p>
                            <p className="mb-2">🚫 <strong>Cancellation is not allowed</strong> after the garbage collector is assigned.</p>
                            <p>🔄 You can schedule your pickup again anytime if the collection was missed.</p>
                        </div>

 
                    </section>

                    {/* CTA Section */}
                    <section className="bg-green-700 text-white rounded-xl p-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Go Green?</h2>
                        <p className="text-xl mb-6 max-w-2xl mx-auto">Join thousands of environmentally conscious individuals and businesses making a positive impact on our planet.</p>
                        <Link to="/schedule/new">
                            <Button size="lg" className="bg-white text-green-800 hover:bg-green-100">
                                Schedule Your First Pickup
                            </Button>
                        </Link>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default HomePage;