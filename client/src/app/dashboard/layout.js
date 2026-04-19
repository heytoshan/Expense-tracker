'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar />
        <main style={{ minHeight: '100vh', paddingLeft: 248 }} className="max-lg:!pl-0">
          <div style={{ padding: '24px', paddingTop: 24, maxWidth: 1200, margin: '0 auto' }} className="max-lg:pt-16">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
