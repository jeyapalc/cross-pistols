import { useState } from 'react';

const REQUIRED_TOKEN = 'RCMP-TACTICAL';
const REQUIRED_DOMAIN = '@rcmp-grc.gc.ca';

export default function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = email.trim().toLowerCase();
        const cleanToken = token.trim();

        if (!cleanEmail.endsWith(REQUIRED_DOMAIN)) {
            setError(`Unauthorized Domain. Registration locked to ${REQUIRED_DOMAIN} networks.`);
            return;
        }

        if (cleanToken !== REQUIRED_TOKEN) {
            setError('Invalid access token provided. Access denied.');
            return;
        }

        onLogin();
    };

    return (
        <div className="fixed inset-0 bg-[#0d0d12] flex flex-col items-center justify-center z-50 p-4 animate-fade-in">
            {/* Clean Transparent Logo */}
            <img 
                src="/loading-logo.png" 
                alt="Logo" 
                className="w-32 h-32 sm:w-48 sm:h-48 object-contain opacity-90 drop-shadow-2xl mb-12" 
            />
            
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
                <div className="hud-border p-8 border-white/5 bg-white/5 backdrop-blur-md relative group">
                    <div className="hud-crosshair-v"></div>
                    
                    <h2 className="text-white font-black tracking-widest text-xl mb-6 uppercase text-center drop-shadow-lg">
                        SYSTEM AUTHENTICATION
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
                                Secure Identity (Email)
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 text-white font-mono p-3 outline-none focus:border-emerald-500/50 transition-colors placeholder:text-neutral-700"
                                placeholder="member@rcmp-grc.gc.ca"
                            />
                        </div>

                        <div>
                            <label className="block font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
                                Access Token
                            </label>
                            <input
                                type="password"
                                required
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 text-white font-mono p-3 outline-none focus:border-emerald-500/50 transition-colors placeholder:text-neutral-700"
                                placeholder="Enter Token"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 border border-red-500/50 bg-red-500/10 p-3 text-center">
                            <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-widest block">
                                {error}
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full mt-8 bg-emerald-600/90 hover:bg-emerald-500 text-white font-black py-4 uppercase tracking-[0.2em] transition-all hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-500"
                    >
                        APPROVE CLEARANCE
                    </button>
                </div>
            </form>
        </div>
    );
}
