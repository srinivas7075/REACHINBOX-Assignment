"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        router.push('/');
    };

    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/dashboard" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    REACHINBOX
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <span className="text-sm font-medium">Demo User</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
