import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-white">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
