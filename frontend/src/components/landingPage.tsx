import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star, ArrowRight, X } from 'lucide-react';
import { SignupForm } from './auth/SignupForm';
import { Link } from 'react-router-dom';

const TravelAgencyLanding = () => {
  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Discover Amazing Destinations',
      subtitle: 'Explore the world with our exclusive travel packages'
    },
    {
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1968&q=80',
      title: 'Luxury Travel Experiences',
      subtitle: 'Tailored vacations for the discerning traveler'
    },
    {
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Adventure Awaits',
      subtitle: 'Create unforgettable memories with our adventure tours'
    }
  ];

  // Popular Destinations
  const popularDestinations = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Bali, Indonesia',
      rating: 4.8,
      price: '$1200'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1538970272646-f61fabb3bfdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Santorini, Greece',
      rating: 4.9,
      price: '$1800'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Kyoto, Japan',
      rating: 4.7,
      price: '$2100'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2089&q=80',
      title: 'Paris, France',
      rating: 4.9,
      price: '$1500'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Maldives',
      rating: 4.9,
      price: '$2500'
    }
  ];

  // Auto slide change for hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === 'Escape') {
        setShowSignupModal(false);
      }
    };

    if (showSignupModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showSignupModal]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Wanderlust</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Home</a>
              <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">About</a>
              <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Popular Destinations</a>
              <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Explore</a>
            </div>

            {/* Sign Up Button */}
            <div className="flex items-center">
              <button
                onClick={() => setShowSignupModal(true)}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Up
              </button>
            <div className="flex items-center">
              <button
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Link to="/login">Login</Link>
              </button>
            </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <div className="relative pt-16 h-screen">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
              <div className="max-w-2xl mx-auto text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-8 animate-fadeIn delay-100">{slide.subtitle}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg animate-fadeIn delay-200 flex items-center mx-auto">
                  Explore Now <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-gray-800" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-gray-800" />
        </button>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Popular Destinations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Destinations</h2>
            <p className="text-lg text-gray-600">Explore our most sought-after travel destinations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {popularDestinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <img
                    src={destination.image}
                    alt={destination.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">{destination.title}</h3>
                  </div>
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{destination.title.split(',')[0]}</span>
                    </div>
                    <span className="text-blue-600 font-bold">{destination.price}</span>
                  </div>
                  <button className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                    View Package
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              View All Destinations <ArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8">Sign up today and get 10% off your first booking!</p>
          <button
            onClick={() => setShowSignupModal(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100"
          >
            Get Started <ArrowRight className="ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Wanderlust</h3>
              <p className="text-gray-400">Making travel dreams come true since 2010.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Destinations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tours</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Special Deals</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Wanderlust Travel Agency. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
    </div>
  );
};

const SignupModal = ({ onClose }: { onClose: () => void }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <SignupForm  />
        </div>
      </div>
    </div>
  );
};
export default TravelAgencyLanding;