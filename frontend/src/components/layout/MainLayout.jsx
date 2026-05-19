import React from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isFluid = ['/matches', '/create', '/premium', '/explore'].includes(location.pathname);

  return (
    <div className="app-layout">
      <Header />
      <main className={`pt-nav ${isFluid ? 'px-4 md:px-10 lg:px-20' : 'container'} animate-fade-in`}>
        {children}
      </main>
      <footer className="footer mt-10">
        <div className="container text-center py-8">
          <p className="text-muted3 text-xs">
            © 2026 MeetSport. Tots els drets reservats.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
