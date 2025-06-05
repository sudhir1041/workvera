import React from 'react';

const Footer = () => {
  return (
    
    <footer className="bg-teal-700 text-white py-8 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-lg font-semibold">&copy; {new Date().getFullYear()} WorkVera</p>
        <p className="text-sm text-gray-300 mt-1">
          Connecting talent with opportunity, bridging career gaps with understanding and support.
        </p>
        <div className="mt-4">
          <a href="/contact" className="text-gray-200 hover:text-white px-3 py-1 text-sm">Contact Us</a>
          <span className="text-gray-400">|</span>
          <a href="/privacy" className="text-gray-200 hover:text-white px-3 py-1 text-sm">Privacy Policy</a>
          <span className="text-gray-400">|</span>
          <a href="/terms" className="text-gray-200 hover:text-white px-3 py-1 text-sm">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;