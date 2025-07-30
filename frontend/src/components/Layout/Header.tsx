import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProp{
    title: string;
}

export const Header: React.FC<HeaderProp> = ({ title }) => {
    const {user } = useAuth();

    return(
      <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <img
              src={user?.image}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-right">
              <p className="font-medium text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
    )
};

export default Header;
