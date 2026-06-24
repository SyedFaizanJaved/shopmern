import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

// Shared chrome for every page. <Outlet/> is where the matched route renders.
export function Layout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
