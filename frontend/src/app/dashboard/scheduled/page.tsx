"use client";
import React, { useEffect, useState } from 'react';
import { EmailTable } from '@/components/EmailTable';
import { EmailGrid } from '@/components/EmailGrid';
import { api } from '@/lib/api';
import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';

export default function ScheduledPage() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to Grid as requested

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const res = await api.get('/scheduled-emails');
            setEmails(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Scheduled Campaigns</h2>
                    <p className="text-gray-500 mt-1">Manage all your upcoming email blasts.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg border shadow-sm flex items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>

                    <Link href="/dashboard/compose" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                        <span>+ Schedule New</span>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-6 border-b border-gray-200">
                <Link href="/dashboard/scheduled" className="pb-4 px-2 font-bold text-sm border-b-2 border-indigo-600 text-indigo-600">
                    Scheduled
                </Link>
                <Link href="/dashboard/sent" className="pb-4 px-2 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-800 transition-colors">
                    Sent History
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                viewMode === 'grid'
                    ? <EmailGrid emails={emails} type="scheduled" />
                    : <EmailTable emails={emails} type="scheduled" loading={loading} onRefresh={fetchEmails} />
            )}
        </div>
    );
}
