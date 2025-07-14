import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Recycle, Calendar, Clock, User, Phone } from 'lucide-react';

const recycleImage = "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=1000&auto=format&fit=crop";
const cityImage = "https://www.banyannation.com/wp-content/uploads/2024/10/Sustainable-Waste-Management.jpg";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={cityImage}
            alt="Green City"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2905]/90 to-[#0A2905]/50" />
        </div>
        <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm w-fit px-4 py-2 rounded-full">
              <Recycle className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Sustainable Waste Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Making Our World Cleaner, One Pickup at a Time
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Schedule waste collection, track your waste management history, and contribute to a greener planet with GreenCycle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                <Link to="/signup/user" className="flex items-center gap-2">
                  Sign Up <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-[#0A2905] hover:bg-white/90">
                <Link to="/login" className="flex items-center gap-2">
                  Login <User className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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
                  <h3 className="text-xl font-semibold mb-2">Schedule Collection</h3>
                  <p className="text-gray-600">
                    Easily schedule waste collection at your preferred time and location.
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

      {/* Articles Section
      <section className="py-20">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Learn About Waste Management</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill({
              image: recycleImage,
              title: 'Recyclable Waste Management',
              excerpt: 'Learn how to properly sort and manage recyclable waste for maximum environmental impact.'
            }).map((article, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Button variant="link" className="text-green-600 p-0">
                    Read more <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 bg-[#0A2905]">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Green Journey?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of users who are making a difference in their communities with GreenCycle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#0A2905] hover:bg-white/90">
              <Link to="/signup/user">Get Started</Link>
            </Button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">GREEN CYCLE</h3>
              <p className="text-gray-400">
                Making waste management efficient and environmentally friendly.
              </p>
            </div>
            {/* <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/schedule" className="text-gray-400 hover:text-white transition-colors">Schedule</Link></li>
                <li><Link to="/history" className="text-gray-400 hover:text-white transition-colors">History</Link></li>
                <li><Link to="/recyclable-waste" className="text-gray-400 hover:text-white transition-colors">Articles</Link></li>
              </ul>
            </div> */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">support@greencycle.com</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">+1 (555) 123-4567</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 GreenCycle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;