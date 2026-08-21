function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-2xl font-extrabold text-orange-500 flex items-center gap-2">
              🍔 FoodHub
            </h2>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Bringing your favorite meals from the best local restaurants straight to your doorstep.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-200">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition">About Us</li>
              <li className="hover:text-orange-500 cursor-pointer transition">Careers</li>
              <li className="hover:text-orange-500 cursor-pointer transition">Team</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-200">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition">Help Center</li>
              <li className="hover:text-orange-500 cursor-pointer transition">Safety</li>
              <li className="hover:text-orange-500 cursor-pointer transition">Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-gray-200">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="hover:text-orange-500 cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-orange-500 cursor-pointer transition">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} FoodHub. All rights reserved.
          </p>
          
          {/* Social Icons Placeholder */}
          <div className="flex gap-6 text-gray-400">
            <span className="hover:text-orange-500 cursor-pointer transition">Instagram</span>
            <span className="hover:text-orange-500 cursor-pointer transition">Twitter</span>
            <span className="hover:text-orange-500 cursor-pointer transition">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;