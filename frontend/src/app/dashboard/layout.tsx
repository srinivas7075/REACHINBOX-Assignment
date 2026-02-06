import { Navbar } from '@/components/Navbar';
import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <Navbar />
            <main className="container mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
