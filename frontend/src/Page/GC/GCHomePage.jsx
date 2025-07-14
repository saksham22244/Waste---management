import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/GCSidebar';
import { Button } from '../../components/ui/button';
import { ArrowRight, CheckCircle, RecycleIcon, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Recycle, Calendar, Clock, User, Phone } from 'lucide-react';
const GCHomePage = () => {
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
                                <Link to="/pickup">
                                    <Button size="lg" className="bg-white text-green-800 hover:bg-green-100">
                                        View Your Pickups <ArrowRight className="ml-2 h-5 w-5" />
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

                    <section className="py-20 bg-gray-50">
                        <div className="container max-w-7xl mx-auto px-4 md:px-6">
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">How GreenCycle Works</h2>
                                <p className="text-lg text-gray-600">
                                    Our platform makes waste management simple, efficient, and environmentally friendly.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                <Calendar className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">Pick Collection</h3>
                                            <p className="text-gray-600">
                                                Easily Pick waste collection
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                <Clock className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">Track History</h3>
                                            <p className="text-gray-600">
                                                Monitor your waste management history and contribution to sustainability.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                                <Phone className="h-6 w-6 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">Get Support</h3>
                                            <p className="text-gray-600">
                                                Connect with our team for any questions or support regarding waste management.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    {/* <section className="mb-16 bg-white rounded-xl shadow-md p-8">
                        <h2 className="text-3xl font-bold mb-8 text-center text-green-800">Making a Difference Together</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <p className="text-4xl font-bold text-green-600">2.5K+</p>
                                <p className="text-gray-600">Monthly Collections</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-green-600">75%</p>
                                <p className="text-gray-600">Waste Recycled</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-green-600">10K+</p>
                                <p className="text-gray-600">Satisfied Customers</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-green-600">500+</p>
                                <p className="text-gray-600">Trees Saved</p>
                            </div>
                        </div>
                    </section> */}

                    {/* CTA Section */}
                    <section className="bg-green-700 text-white rounded-xl p-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Go Green?</h2>
                        <p className="text-xl mb-6 max-w-2xl mx-auto">Join thousands of environmentally conscious individuals and businesses making a positive impact on our planet.</p>
                        <Link to="/pickup">
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

export default GCHomePage;