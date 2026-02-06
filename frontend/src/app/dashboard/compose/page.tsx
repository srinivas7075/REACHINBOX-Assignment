"use client";
import React, { useState, ChangeEvent } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Upload, Calendar, Clock, Gauge, Send, X } from 'lucide-react';

export default function ComposePage() {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [emailCount, setEmailCount] = useState<number>(0);
    const [startTime, setStartTime] = useState('');
    const [rateLimit, setRateLimit] = useState('10'); // Default 10/hr
    const [startDelay, setStartDelay] = useState('2'); // Default 2s

    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Basic client-side count estimation
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                // Simple regex for emails
                const matches = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                setEmailCount(matches ? matches.length : 0);
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !subject || !body) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', subject);
        formData.append('body', body);
        formData.append('startTime', startTime);
        formData.append('rateLimit', rateLimit);
        formData.append('startDelay', startDelay);
        formData.append('senderId', '1'); // Mock sender ID

        try {
            await api.post('/schedule', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Campaign scheduled successfully!');
            router.push('/dashboard/scheduled');
        } catch (error) {
            console.error(error);
            alert('Failed to schedule campaign');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Compose New Campaign</h1>

            <form onSubmit={handleSchedule} className="space-y-6">
                {/* Subject & Body */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                            placeholder="Enter email subject"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px] text-gray-900"
                            placeholder="Enter email content..."
                            required
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-6"></div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient List (CSV/Text)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center">
                        <input
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            required
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="text-gray-400" size={32} />
                            <span className="text-blue-600 font-medium hover:underline">Click to upload</span>
                            <span className="text-sm text-gray-500">or drag and drop CSV file</span>
                        </label>
                        {file && (
                            <div className="mt-4 bg-white px-4 py-2 rounded border border-blue-100 text-blue-700 text-sm flex items-center justify-between">
                                <span>Selected: <strong>{file.name}</strong> ({emailCount} emails detected)</span>
                                <button type="button" onClick={() => { setFile(null); setEmailCount(0); }} className="text-gray-500 hover:text-red-500">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-6"></div>

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Calendar size={14} /> Start Time (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Gauge size={14} /> Hourly Limit
                        </label>
                        <input
                            type="number"
                            value={rateLimit}
                            onChange={e => setRateLimit(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Clock size={14} /> Delay (seconds)
                        </label>
                        <input
                            type="number"
                            value={startDelay}
                            onChange={e => setStartDelay(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
                            min="0"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            'Scheduling...'
                        ) : (
                            <>
                                <Send size={18} /> Schedule Campaign
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
