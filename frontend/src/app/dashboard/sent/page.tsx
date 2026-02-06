"use client";
import React, { useEffect, useState } from 'react';
import { EmailTable } from '@/components/EmailTable';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function SentPage() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const res = await api.get('/sent-emails');
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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Sent Emails</h2>
            </div>
            <div className="flex items-center gap-4 border-b mb-6">
                <Link href="/dashboard/scheduled" className="pb-3 px-1 font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700">Scheduled Emails</Link>
                <Link href="/dashboard/sent" className="pb-3 px-1 font-medium text-sm border-b-2 border-blue-600 text-blue-600">Sent Emails</Link>
            </div>

            <EmailTable emails={emails} type="sent" loading={loading} onRefresh={fetchEmails} />
        </div>
    );
}
