import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USERS } from '../constants';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Magic Link Simulation Logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if it's David (Stakeholder) for Magic Link flow
    if (email === USERS.DAVID.email) {
        setTimeout(() => {
            setMagicLinkSent(true);
            setIsLoading(false);
        }, 1000);
    } else {
        // Sarah logs in directly (passwordless simulation for prototype speed)
        await login(email);
        setIsLoading(false);
    }
  };

  const handleMagicLinkClick = async () => {
      await login(USERS.DAVID.email);
  };

  if (magicLinkSent) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                  <p className="text-gray-600 mb-8">We sent a magic link to {email}</p>
                  
                  {/* Simulation Button */}
                  <div className="border-t border-gray-100 pt-6">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Prototype Only</p>
                      <button 
                        onClick={handleMagicLinkClick}
                        className="w-full bg-[#4A90E2] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                          Click here to simulate clicking the email link
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
           <div className="h-12 w-12 bg-[#4A90E2] rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">D</span>
           </div>
           <h1 className="text-3xl font-bold text-gray-900">The Deal Room</h1>
           <p className="text-gray-500 mt-2">Orchestrate your complex deals.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4A90E2] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Prototype Helpers */}
        <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 mb-4">PROTOTYPE SHORTCUTS</p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setEmail(USERS.SARAH.email)}
                    className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 text-sm"
                >
                    <span className="font-bold text-gray-900">Sarah</span>
                    <span className="text-xs text-gray-500">Account Exec</span>
                </button>
                <button 
                    onClick={() => setEmail(USERS.DAVID.email)}
                    className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 text-sm"
                >
                    <span className="font-bold text-gray-900">David</span>
                    <span className="text-xs text-gray-500">Legal Counsel</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export const Onboarding: React.FC = () => {
    const { connectCRM } = useApp();
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

    const handleConnect = async () => {
        setStatus('loading');
        // Simple 20% random failure chance for error handling story
        const randomFail = Math.random() < 0.2; 
        
        if (randomFail) {
            setTimeout(() => setStatus('error'), 800);
            return;
        }

        await connectCRM();
    };

    return (
        <div className="max-w-2xl mx-auto text-center pt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to The Deal Room</h2>
            <p className="text-lg text-gray-600 mb-12">
                Stop juggling Slack threads and emails. Sync your deals from CRM to start orchestrating your team.
            </p>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center">
                   <span>Connection Failed. Please try again.</span>
                </div>
            )}

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600">CRM</span>
                        </div>
                        <ArrowRight className="text-gray-400" />
                        <div className="h-12 w-12 bg-[#4A90E2] rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white">D</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleConnect}
                        disabled={status === 'loading'}
                        className="bg-[#4A90E2] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        {status === 'loading' ? 'Connecting...' : 'Connect your CRM'}
                    </button>
                </div>
                <p className="text-sm text-gray-500 text-left">
                    We'll securely sync your open opportunities. No data will be written back to your CRM without permission.
                </p>
            </div>
        </div>
    )
}
