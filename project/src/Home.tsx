import React, { useState, useEffect } from 'react';
import { Sprout, Search, UserPlus, LogIn, ChevronRight, ChevronLeft, Tractor, Store, Users, QrCode, Warehouse, ShoppingCart, Truck, Scan as Scanner, Twitter, Linkedin, Mail } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const heroSlides = [
    {
      role: "Farmer",
      image: "https://images.unsplash.com/photo-1592982537447-6e3e1bde5b6e?auto=format&fit=crop&q=80",
      text: "Connect directly with buyers and get better prices for your crops"
    },
    {
      role: "Middleman",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80",
      text: "Streamline your supply chain and access quality produce"
    },
    {
      role: "Consumer",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80",
      text: "Know your food's journey from farm to table"
    }
  ];

  const testimonials = [
    {
      name: "John Smith",
      role: "Farmer",
      text: "My profits increased by 40% after joining the platform",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
    },
    {
      name: "Sarah Johnson",
      role: "Consumer",
      text: "I feel safer knowing exactly where my food comes from",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80"
    },
    {
      name: "Mike Wilson",
      role: "Distributor",
      text: "The platform has revolutionized our supply chain efficiency",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-green-800">AgriTech</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="\Users\sudha\Downloads\home\project\src\Home.tsx" className="text-gray-700 hover:text-green-600">Home</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-green-600">How it Works</a>
              <a href="#marketplace" className="text-gray-700 hover:text-green-600">Marketplace</a>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              </div>
              <Link to="/login" className="flex items-center text-gray-700 hover:text-green-600">
        <UserPlus className="h-5 w-5 mr-1" />
        Register/login
      </Link>
              {/* <button className="flex items-center text-gray-700 hover:text-green-600">
                <LogIn className="h-5 w-5 mr-1" />
                Login
              </button> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <div className="relative pt-16 h-screen">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].role}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-5xl font-bold text-white mb-6">
              {heroSlides[currentSlide].role}'s Platform
            </h1>
            <p className="text-2xl text-white mb-8 max-w-2xl">
              {heroSlides[currentSlide].text}
            </p>
            <div className="flex space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Join Now
              </button>
              <button className="bg-white hover:bg-gray-100 text-green-800 px-8 py-3 rounded-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? 'bg-green-500' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <UserPlus className="w-12 h-12 text-green-600" />,
                title: "Farmer Registration",
                description: "Farmers register and list their produce"
              },
              {
                icon: <ShoppingCart className="w-12 h-12 text-green-600" />,
                title: "Buyer Places Order",
                description: "Buyers select and purchase produce directly"
              },
              {
                icon: <QrCode className="w-12 h-12 text-green-600" />,
                title: "Blockchain Secures Data",
                description: "Every transaction is securely recorded"
              },
              {
                icon: <Scanner className="w-12 h-12 text-green-600" />,
                title: "Track & Verify",
                description: "Scan QR code to view product journey"
              }
            ].map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="flex justify-center mb-6">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role-specific CTAs */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Join Our Ecosystem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                icon: <Tractor className="w-10 h-10" />,
                title: "Farmers",
                cta: "Sell Your Crops",
                color: "bg-green-600"
              },
              {
                icon: <Store className="w-10 h-10" />,
                title: "Processors",
                cta: "Buy Directly",
                color: "bg-blue-600"
              },
              {
                icon: <Truck className="w-10 h-10" />,
                title: "Distributors",
                cta: "Partner with Us",
                color: "bg-purple-600"
              },
              {
                icon: <Warehouse className="w-10 h-10" />,
                title: "Retailers",
                cta: "Source Ethically",
                color: "bg-orange-600"
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: "Consumers",
                cta: "Scan & Verify",
                color: "bg-red-600"
              }
            ].map((role, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`${role.color} text-white rounded-xl p-6 text-center transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                  <div className="flex justify-center mb-4">{role.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                  <p className="text-white/90">{role.cta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Carousel */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Success Stories
          </h2>
          
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
                      <div className="flex items-center mb-6">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                          <p className="text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg italic">"{testimonial.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Sprout className="h-8 w-8 text-green-500" />
                <span className="ml-2 text-xl font-bold">AgriTech</span>
              </div>
              <p className="text-gray-400">Revolutionizing agriculture through technology</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Marketplace</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <Mail className="w-5 h-5 mr-2" />
                  info@agritech.com
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AgriTech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;