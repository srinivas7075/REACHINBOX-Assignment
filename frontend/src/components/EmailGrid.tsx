import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Mail, Calendar, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Email {
    id: number;
    recipient_email: string;
    subject: string;
    body: string;
    status: string;
    scheduled_time?: string;
    sent_at?: string;
    created_at?: string;
}

interface EmailGridProps {
    emails: Email[];
    type: 'scheduled' | 'sent';
}

export function EmailGrid({ emails, type }: EmailGridProps) {
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

    const toggleSubject = (subjectKey: string) => {
        const newExpanded = new Set(expandedSubjects);
        if (newExpanded.has(subjectKey)) {
            newExpanded.delete(subjectKey);
        } else {
            newExpanded.add(subjectKey);
        }
        setExpandedSubjects(newExpanded);
    };

    // Group emails by Date
    const groupedEmails = emails.reduce((acc, email) => {
        const dateKey = email.scheduled_time
            ? format(new Date(email.scheduled_time), 'yyyy-MM-dd')
            : format(new Date(email.created_at || new Date()), 'yyyy-MM-dd');

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(email);
        return acc;
    }, {} as Record<string, Email[]>);

    // Sort dates (descending)
    const sortedDates = Object.keys(groupedEmails).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="space-y-12">
            {sortedDates.map((date) => {
                // Secondary Grouping: By Subject
                const emailsBySubject = groupedEmails[date].reduce((acc, email) => {
                    const subject = email.subject || '(No Subject)';
                    if (!acc[subject]) acc[subject] = [];
                    acc[subject].push(email);
                    return acc;
                }, {} as Record<string, Email[]>);

                return (
                    <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* DATE HEADER - HIGH CONTRAST */}
                        <h3 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b-2 border-slate-200 pb-4">
                            <Calendar className="w-8 h-8 text-blue-600" />
                            {format(new Date(date), 'EEEE, MMMM do, yyyy')}
                        </h3>

                        <div className="space-y-6">
                            {Object.keys(emailsBySubject).map((subject) => {
                                const subjectEmails = emailsBySubject[subject];
                                const subjectKey = `${date}-${subject}`;
                                const isExpanded = expandedSubjects.has(subjectKey);

                                // Stats
                                const sentCount = subjectEmails.filter(e => e.status === 'sent').length;
                                const failedCount = subjectEmails.filter(e => e.status === 'failed').length;
                                const totalCount = subjectEmails.length;

                                return (
                                    <div key={subjectKey} className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden hover:border-blue-200 transition-all duration-300 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10">
                                        {/* Accordion Header */}
                                        <div
                                            onClick={() => toggleSubject(subjectKey)}
                                            className="p-6 cursor-pointer hover:bg-white/50 transition-colors flex items-center justify-between group select-none"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`p-4 rounded-2xl transition-all duration-300 ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                                                    }`}>
                                                    <Mail size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                        {subject}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-500">
                                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                                                            {totalCount} emails
                                                        </span>
                                                        {sentCount > 0 && (
                                                            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                                                                <CheckCircle size={14} /> {sentCount} sent
                                                            </span>
                                                        )}
                                                        {failedCount > 0 && (
                                                            <span className="flex items-center gap-1 text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                                                                <AlertCircle size={14} /> {failedCount} failed
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300 ${isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                            </div>
                                        </div>

                                        {/* Expanded Content: The Grid */}
                                        {isExpanded && (
                                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {subjectEmails.map((email) => (
                                                        <div
                                                            key={email.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedEmail(email);
                                                            }}
                                                            className={`group/card relative bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5 ${email.status === 'sent' ? 'border-l-4 border-l-emerald-500 border-slate-100' :
                                                                    email.status === 'failed' ? 'border-l-4 border-l-rose-500 border-slate-100' :
                                                                        'border-l-4 border-l-blue-500 border-slate-100'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                                <div className={`p-2.5 rounded-xl ${email.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                                                                        email.status === 'failed' ? 'bg-rose-50 text-rose-600' :
                                                                            'bg-blue-50 text-blue-600'
                                                                    }`}>
                                                                    {email.status === 'sent' ? <CheckCircle size={18} /> :
                                                                        email.status === 'failed' ? <AlertCircle size={18} /> :
                                                                            <Clock size={18} />}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                                    {email.scheduled_time ? format(new Date(email.scheduled_time), 'h:mm a') : '-'}
                                                                </span>
                                                            </div>

                                                            <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                                <Mail size={14} className="text-slate-400" />
                                                                {email.recipient_email}
                                                            </p>

                                                            <div className="text-sm text-slate-500 line-clamp-2 bg-slate-50 p-4 rounded-xl italic border border-slate-100 group-hover/card:bg-white group-hover/card:shadow-inner transition-colors">
                                                                "{email.body}"
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Email Details Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedEmail(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedEmail.subject}</h3>
                                <p className="text-sm text-blue-600 font-medium mt-1">{selectedEmail.recipient_email}</p>
                            </div>
                            <button onClick={() => setSelectedEmail(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 bg-white">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <Calendar size={14} className="text-blue-500" />
                                    {selectedEmail.scheduled_time ? format(new Date(selectedEmail.scheduled_time), 'PPP p') : 'No Date'}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg capitalize font-bold ${selectedEmail.status === 'sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        selectedEmail.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                            'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}>
                                    {selectedEmail.status}
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed">
                                <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
