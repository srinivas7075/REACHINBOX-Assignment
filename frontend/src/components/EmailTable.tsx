import React from 'react';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

interface Email {
    id: number;
    recipient_email: string;
    subject: string;
    status: string;
    scheduled_time?: string;
    sent_at?: string;
}

interface EmailTableProps {
    emails: Email[];
    type: 'scheduled' | 'sent';
    loading?: boolean;
    onRefresh?: () => void;
}

export function EmailTable({ emails, type, loading, onRefresh }: EmailTableProps) {
    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading emails...</div>;
    }

    if (emails.length === 0) {
        return (
            <div className="p-12 text-center border rounded-lg bg-white">
                <p className="text-gray-500">No {type} emails found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="font-medium capitalize">{type} Emails</h3>
                {onRefresh && (
                    <button onClick={onRefresh} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <RefreshCw size={16} />
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-900 font-bold uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-lg">Recipient</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">{type === 'scheduled' ? 'Scheduled For' : 'Sent At'}</th>
                            <th className="px-6 py-4 rounded-tr-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {emails.map((email) => (
                            <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 font-medium text-gray-900">{email.recipient_email}</td>
                                <td className="px-6 py-3 max-w-xs truncate text-gray-900" title={email.subject}>{email.subject}</td>
                                <td className="px-6 py-3 text-gray-500">
                                    {email.scheduled_time && type === 'scheduled'
                                        ? format(new Date(email.scheduled_time), 'PPp')
                                        : email.sent_at
                                            ? format(new Date(email.sent_at), 'PPp')
                                            : '-'}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${email.status === 'sent' ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-200' :
                                            email.status === 'failed' ? 'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border border-rose-200' :
                                                'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                                        }`}>
                                        {email.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
