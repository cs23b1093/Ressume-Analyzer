import { Check, Sparkles, Crown } from 'lucide-react';

const Pricing = () => {
    const handleSelectPlan = (plan) => {
        console.log(`Selected plan: ${plan}`);
        // Add your payment/plan selection logic here
    };

    return (
        <div className="min-h-screen bg-white py-16 px-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Andada+Pro:wght@400;500;600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');
                
                .andada-pro {
                    font-family: 'Andada Pro', serif;
                }
                
                .highlight-orange {
                    font-family: 'Architects Daughter', cursive;
                    color: #ff6b35;
                    text-decoration: underline;
                    text-decoration-color: #ff6b35;
                    text-decoration-thickness: 2px;
                    text-underline-offset: 4px;
                }
            `}</style>

            <div className="max-w-6xl mx-auto andada-pro">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-black mb-4">
                        Choose Your <span className="highlight-orange">Plan</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Start for free or unlock unlimited access
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-gray-600" />
                            <h2 className="text-3xl font-bold text-black">Free Plan</h2>
                        </div>
                        
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-black">$0</span>
                                <span className="text-gray-600 text-lg">forever</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Perfect for trying out our AI-powered resume tools
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    <strong>1 Detailed Feedback</strong> session
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    <strong>5 ATS Score Checks</strong>
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    Basic resume analysis
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    Quick turnaround time
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSelectPlan('free')}
                            className="w-full py-4 px-6 bg-gray-800 text-white rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors"
                        >
                            Get Started Free
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 border-2 border-orange-500 relative hover:shadow-xl transition-all duration-300">
                        {/* Popular Badge */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                                MOST POPULAR
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <Crown className="w-8 h-8 text-orange-500" />
                            <h2 className="text-3xl font-bold text-black">Pro Plan</h2>
                        </div>
                        
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-black">$10</span>
                                <span className="text-gray-700 text-lg">/ month</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                Everything you need to land your dream job
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    <strong>Unlimited Detailed Feedback</strong>
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    <strong>Unlimited ATS Score Checks</strong>
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    <strong>Premium Resume Templates</strong>
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    Advanced AI analysis
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    Priority support
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-800 text-lg">
                                    Cancel anytime
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSelectPlan('pro')}
                            className="w-full py-4 px-6 bg-orange-500 text-white rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 text-lg">
                        Have questions? <a href="/contact" className="text-orange-500 underline hover:text-orange-600">Contact us</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;