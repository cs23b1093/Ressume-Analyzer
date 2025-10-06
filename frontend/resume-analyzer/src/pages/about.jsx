import { Target, Users, Zap, Heart } from 'lucide-react';

const About = () => {
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
                
                .highlight-gray {
                    font-family: 'Architects Daughter', cursive;
                    color: #6b7280;
                    text-decoration: underline;
                    text-decoration-color: #6b7280;
                    text-decoration-thickness: 2px;
                    text-underline-offset: 4px;
                }
            `}</style>

            <div className="max-w-6xl mx-auto andada-pro">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                        We're Here to Help You <span className="highlight-orange">Stand Out</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        We believe every job seeker deserves a fair chance. That's why we built AI-powered tools 
                        to help you create resumes that get noticed by both humans and algorithms.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="mb-20">
                    <div className="bg-gray-50 rounded-3xl p-12 border-2 border-gray-200">
                        <div className="flex items-center gap-4 mb-6">
                            <Target className="w-12 h-12 text-orange-500" />
                            <h2 className="text-4xl font-bold text-black">Our Mission</h2>
                        </div>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            The job market is competitive, and <span className="highlight-gray">getting past ATS systems</span> can 
                            feel impossible. We created this platform to level the playing field. Our AI analyzes your 
                            resume the same way recruiters and <span className="highlight-orange">ATS systems</span> do, giving you 
                            actionable insights to improve your chances of landing interviews.
                        </p>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="mb-20">
                    <h2 className="text-4xl font-bold text-black text-center mb-12">
                        What We <span className="highlight-orange">Believe In</span>
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-200">
                            <Users className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Everyone Deserves a Chance
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                Your skills matter more than how well you format a document. 
                                We help you present your best self.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                            <Zap className="w-10 h-10 text-gray-600 mb-4" />
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Speed Matters
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                Job hunting is stressful enough. Get instant feedback 
                                so you can apply with confidence, faster.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-200">
                            <Heart className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-2xl font-bold text-black mb-4">
                                Transparency First
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                No hidden tricks or vague advice. We tell you exactly 
                                what to fix and why it matters.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Story Section */}
                <div className="mb-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-black mb-6">
                                How It <span className="highlight-orange">Started</span>
                            </h2>
                            <p className="text-xl text-gray-700 leading-relaxed mb-6">
                                We've been there. Sending out dozens of applications and hearing nothing back. 
                                Not because we weren't qualified, but because our resumes didn't make it past 
                                the <span className="highlight-gray">automated filters</span>.
                            </p>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                So we built something better. A tool that <span className="highlight-orange">understands what ATS 
                                systems look for</span> and helps you optimize your resume without sacrificing 
                                authenticity or spending hours researching best practices.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-12 border-2 border-orange-200">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-orange-500 mb-4">1000+</div>
                                <p className="text-xl text-gray-700 font-semibold mb-6">Resumes Analyzed</p>
                                <div className="text-6xl font-bold text-orange-500 mb-4">95%</div>
                                <p className="text-xl text-gray-700 font-semibold mb-6">User Satisfaction</p>
                                <div className="text-6xl font-bold text-orange-500 mb-4">24/7</div>
                                <p className="text-xl text-gray-700 font-semibold">AI Available</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gray-50 rounded-3xl p-12 border-2 border-gray-200">
                    <h2 className="text-4xl font-bold text-black mb-6">
                        Ready to <span className="highlight-orange">Get Started</span>?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of job seekers who've improved their resumes and landed more interviews.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a 
                            href="/register" 
                            className="px-8 py-4 bg-orange-500 text-white rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Start Free Trial
                        </a>
                        <a 
                            href="/pricing" 
                            className="px-8 py-4 bg-gray-800 text-white rounded-full text-lg font-semibold hover:bg-gray-900 transition-colors"
                        >
                            View Pricing
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;