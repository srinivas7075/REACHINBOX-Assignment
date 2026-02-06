"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Mock login for now
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">

        {/* Left Side - Hero */}
        <div className="hidden md:flex flex-col justify-center p-12 w-1/2 bg-blue-600 text-white relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Mail size={300} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Automate your outreach</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-blue-200" />
                <span>Smart Email Scheduling</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-blue-200" />
                <span>Bulk Campaign Management</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-blue-200" />
                <span>Detailed Analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-10">
            <div className="inline-flex h-12 w-12 bg-blue-100 text-blue-600 rounded-xl items-center justify-center mb-6">
              <Mail size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to manage your campaigns</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-lg group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
            <span>Sign in with Google</span>
            <ArrowRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-8 text-center text-sm text-gray-400">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
}
