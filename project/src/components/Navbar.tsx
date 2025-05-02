import React from 'react';
import { NavLink } from 'react-router-dom';
import { Plane as Plant, Users } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { path: '/CropDetails', text: 'Crop Details', icon: <Plant className="w-5 h-5" /> },
    { path: '/Distributors', text: 'Distributors', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white bg-opacity-90 shadow-md mt-4">
      <div className="container mx-auto">
        <ul className="flex justify-center gap-8 p-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-2 rounded-lg transition-colors
                  ${isActive ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-green-50'}`
                }
              >
                {item.icon}
                {item.text}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;