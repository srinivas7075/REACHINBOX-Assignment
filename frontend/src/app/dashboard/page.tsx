"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Link href="/dashboard/compose" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={18} />
                    Compose New Email
                </Link>
            </div>

            <div className="flex items-center gap-4 border-b">
                <TabLink href="/dashboard/scheduled" label="Scheduled Emails" active />
                <TabLink href="/dashboard/sent" label="Sent Emails" />
            </div>

            <div className="p-8 text-center text-gray-500">
                Select a tab to view emails.
            </div>
        </div>
    )
}

function TabLink({ href, label, active }: { href: string, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={clsx(
                "pb-3 px-1 font-medium text-sm transition-colors border-b-2",
                active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
        >
            {label}
        </Link>
    );
}
