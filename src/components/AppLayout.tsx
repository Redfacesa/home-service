import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import WorkersPage from '@/pages/WorkersPage';
import BookingFlow from '@/pages/BookingFlow';
import CustomerDashboard from '@/pages/CustomerDashboard';
import WorkerDashboard from '@/pages/WorkerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

const AppLayout: React.FC = () => {
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [authModal, setAuthModal] = useState<{ open: boolean; tab: 'login' | 'signup'; role: 'customer' | 'worker' }>({
    open: false,
    tab: 'login',
    role: 'customer',
  });
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOpenAuth = useCallback((tab: 'login' | 'signup' = 'login', role: 'customer' | 'worker' = 'customer') => {
    setAuthModal({ open: true, tab, role });
  }, []);

  const handleCloseAuth = useCallback(() => {
    setAuthModal(prev => ({ ...prev, open: false }));
  }, []);

  const handleSelectService = useCallback((service: string) => {
    setSelectedService(service);
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectWorker = useCallback((workerId: string) => {
    setSelectedWorkerId(workerId);
  }, []);

  const handleBookWorker = useCallback((workerId: string) => {
    setSelectedWorkerId(workerId);
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onSelectService={handleSelectService}
            onSelectWorker={handleSelectWorker}
          />
        );
      case 'services':
        return <ServicesPage onSelectService={handleSelectService} />;
      case 'workers':
        return (
          <WorkersPage
            onSelectWorker={handleSelectWorker}
            selectedWorkerId={selectedWorkerId}
            onBookWorker={handleBookWorker}
          />
        );
      case 'booking':
        return (
          <BookingFlow
            preSelectedService={selectedService}
            preSelectedWorkerId={selectedWorkerId}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        );
      case 'customer-dashboard':
        return <CustomerDashboard onNavigate={handleNavigate} />;
      case 'worker-dashboard':
        return <WorkerDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            onSelectService={handleSelectService}
            onSelectWorker={handleSelectWorker}
          />
        );
    }
  };

  const isDashboard = currentPage.includes('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      {!isDashboard && (
        <Footer onNavigate={handleNavigate} />
      )}
      <AuthModal
        isOpen={authModal.open}
        onClose={handleCloseAuth}
        defaultTab={authModal.tab}
        defaultRole={authModal.role}
      />
    </div>
  );
};

export default AppLayout;
