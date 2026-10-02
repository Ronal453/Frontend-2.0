import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CartDrawer from '../cart/CartDrawer';

export default function PublicLayout() {
  return (
    <div className="flex-1 flex flex-col min-h-screen relative pt-[72px]">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      
      <CartDrawer />
    </div>
  );
}
