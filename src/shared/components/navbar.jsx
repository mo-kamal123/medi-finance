import { CircleChevronRight, Power, Settings } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {  toggleSidebar } from '../store/main-slice';

const Navbar = () => {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.main.sidebar)
  return (
    <header className="bg-white border-b border-gray-200 shadow-lg px-4 sm:px-6 h-16 flex items-center justify-between">
      {/* welcome section */}
      <div className="flex items-center gap-3">
        <CircleChevronRight onClick={ () => dispatch(toggleSidebar())} className={`w-6 h-6 text-primary transition-all duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
          مرحباً بك <p className='sub-font font-bold inline text-primary'>Mostafa</p>  في <p className='sub-font font-bold inline text-primary'>Medi Finance</p> 
        </h1>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <button
          className="p-2 rounded-lg hover:bg-red-50 transition"
          aria-label="Logout"
        >
          <Power className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
