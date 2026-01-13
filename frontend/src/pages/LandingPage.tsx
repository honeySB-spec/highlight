import { useNavigate } from 'react-router-dom';
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { ArrowRight, CheckCircle2, Zap, Shield, FileText, Sparkles } from 'lucide-react';

export function LandingPage() {
    const { isSignedIn } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isSignedIn) {
            navigate('/app');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFD] selection:bg-blue-100 overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/30 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/30 rounded-full blur-[128px]" />
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-purple-50/50 rounded-full blur-[96px]" />
            </div>

            <div className="relative z-10">
                {/* Navigation */}
                <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                            SmartHighlight
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isSignedIn ? (
                            <button
                                onClick={handleGetStarted}
                                className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-5 py-2.5 rounded-full bg-white text-gray-900 font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                                    Sign In
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="px-6 pt-20 pb-32 md:pt-32 md:pb-40 max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-blue-100 shadow-sm text-blue-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        New: Gemini 2.0 Integration
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Read Faster with <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                            AI-Powered Highlights
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Upload any PDF and let our advanced AI instantly identify and highlight the key insights, saving you hours of reading time.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        {isSignedIn ? (
                            <button
                                onClick={handleGetStarted}
                                className="w-full md:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group"
                            >
                                Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button className="w-full md:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                                    Get Started for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignInButton>
                        )}

                        <a href="#features" className="w-full md:w-auto px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center">
                            Learn more
                        </a>
                    </div>

                    {/* Hero Image/Preview */}
                    <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-gray-200 to-transparent backdrop-blur-xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white aspect-[16/9] flex items-center justify-center">
                            {/* Abstract representation of the app UI */}
                            <div className="absolute inset-0 bg-gray-50 flex">
                                <div className="w-1/3 border-r border-gray-200 p-6 space-y-4 hidden md:block">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-32 bg-blue-50 rounded-xl border border-blue-100 p-3">
                                        <div className="h-2 bg-blue-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-2 bg-blue-100 rounded w-full mb-1"></div>
                                        <div className="h-2 bg-blue-100 rounded w-full mb-1"></div>
                                    </div>
                                    <div className="h-32 bg-white rounded-xl border border-gray-200 p-3">
                                        <div className="h-2 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                                        <div className="h-2 bg-gray-100 rounded w-full mb-1"></div>
                                    </div>
                                </div>
                                <div className="flex-1 p-8 flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <p className="text-gray-400 font-medium">Upload a PDF to see the magic</p>
                                    </div>
                                </div>
                            </div>
                            {/* Overlay Text */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 md:bg-transparent">
                                <span className="md:hidden text-gray-500 font-medium">App Preview</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Features Section */}
                <section id="features" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Why SmartHighlight?</h2>
                            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                                Stop skimming and start understanding. Our AI does the heavy lifting for you.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                {
                                    icon: <Zap className="w-6 h-6 text-yellow-500" />,
                                    title: "Lightning Fast",
                                    description: "Process extensive documents in seconds using the latest Gemini Flash models."
                                },
                                {
                                    icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
                                    title: "Precision Accuracy",
                                    description: "Advanced context understanding ensures only the most relevant information is highlighted."
                                },
                                {
                                    icon: <Shield className="w-6 h-6 text-blue-500" />,
                                    title: "Secure & Private",
                                    description: "Your documents are processed securely and never shared with third parties."
                                }
                            ].map((feature, index) => (
                                <div key={index} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all group">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your reading?</h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of students and professionals who save time with SmartHighlight.
                        </p>

                        {!isSignedIn ? (
                            <SignInButton mode="modal">
                                <button className="px-10 py-5 rounded-full bg-white text-blue-600 font-bold text-xl hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95">
                                    Get Started for Free
                                </button>
                            </SignInButton>
                        ) : (
                            <button
                                onClick={handleGetStarted}
                                className="px-10 py-5 rounded-full bg-white text-blue-600 font-bold text-xl hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-50 border-t border-gray-200 py-12">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-gray-400 text-sm">
                            © 2026 SmartHighlight. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
