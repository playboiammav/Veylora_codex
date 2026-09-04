'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useUnifiedStore } from '@/lib/unified-store';

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginWithGoogle, loginWithEmail } = useUnifiedStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address (e.g. user@yahoo.com)');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setError('');
    loginWithEmail(email);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        className="relative w-full max-w-md bg-[#09090B] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 text-center pt-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isRegister ? 'Create Veylora Account' : 'Sign In to Veylora'}
          </h2>
          <p className="text-xs text-zinc-400">
            Access your games, movies, gamelist, and social ecosystem across devices.
          </p>
        </div>

        {/* Social Authentication */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-lg active:scale-98"
          >
            {/* Google Monochrome Icon */}
            <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative px-3 bg-[#09090B] text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            or continue with email
          </span>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com (or yahoo, gmail...)"
                className="w-full bg-[#121216] border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121216] border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span>{isRegister ? 'Create Account' : 'Continue with Email'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-zinc-400 hover:text-white transition-colors underline"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
