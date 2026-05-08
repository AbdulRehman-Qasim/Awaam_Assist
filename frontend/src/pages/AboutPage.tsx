import React from 'react';
import MarketingLayout from '@/layouts/MarketingLayout';
import { Card, CardContent } from '@/components/ui/card';
import {
    Target,
    Eye,
    Users,
    Award,
    GraduationCap,
    Building2,
    Heart,
    Sparkles
} from 'lucide-react';

const AboutPage = () => {
    return (
        <MarketingLayout>
            {/* Hero Section */}
            <div className="relative py-20 bg-gradient-to-br from-[#0097b2]/10 via-[#7c3aed]/10 to-[#0097b2]/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#0097b2]/20 text-gray-700 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4 text-[#7c3aed]" />
                            <span>About AwamAssist</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Empowering Pakistani Citizens
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            AwamAssist is Pakistan's comprehensive citizen assistance platform, connecting people with educational opportunities and government benefits.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        <Card className="border-2 hover:border-[#0097b2] transition-colors">
                            <CardContent className="p-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0097b2]/10 text-[#0097b2] mb-6">
                                    <Target className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    To democratize access to information about educational institutions and government schemes,
                                    enabling every Pakistani citizen to make informed decisions about their future and access
                                    the benefits they deserve.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-[#7c3aed] transition-colors">
                            <CardContent className="p-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] mb-6">
                                    <Eye className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    A Pakistan where every citizen has equal access to information and opportunities,
                                    where finding the right university or government scheme is simple, transparent,
                                    and accessible to all.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* What We Offer */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What We Offer
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Two comprehensive modules designed to serve Pakistani citizens
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Education Module */}
                        <Card className="border-2 hover:shadow-xl transition-all hover:border-[#0097b2]">
                            <CardContent className="p-8">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#0097b2] to-[#00c6d7] text-white mb-6">
                                    <GraduationCap className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Education Module</h3>
                                <p className="text-gray-600 mb-6">
                                    Discover and compare 200+ universities across Pakistan. Find the perfect institution
                                    for your educational journey with detailed information about programs, fees, and facilities.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#0097b2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#0097b2]" />
                                        </div>
                                        <span className="text-gray-700">Comprehensive university database</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#0097b2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#0097b2]" />
                                        </div>
                                        <span className="text-gray-700">Advanced search and filtering</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#0097b2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#0097b2]" />
                                        </div>
                                        <span className="text-gray-700">Side-by-side comparison tool</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#0097b2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#0097b2]" />
                                        </div>
                                        <span className="text-gray-700">Personalized recommendations</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Government Schemes Module */}
                        <Card className="border-2 hover:shadow-xl transition-all hover:border-[#7c3aed]">
                            <CardContent className="p-8">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white mb-6">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Government Schemes Module</h3>
                                <p className="text-gray-600 mb-6">
                                    Access information about 100+ government schemes across Pakistan. Find financial assistance,
                                    healthcare, education support, and more benefits you're eligible for.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                                        </div>
                                        <span className="text-gray-700">100+ government schemes</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                                        </div>
                                        <span className="text-gray-700">Eligibility checker tool</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                                        </div>
                                        <span className="text-gray-700">Federal and provincial programs</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                                        </div>
                                        <span className="text-gray-700">Application tracking</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0097b2]/10 text-[#0097b2] mb-6">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Accessibility</h3>
                            <p className="text-gray-600">
                                Making information accessible to every Pakistani citizen, regardless of their background or location.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] mb-6">
                                <Award className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
                            <p className="text-gray-600">
                                Providing accurate, up-to-date information with complete transparency about processes and requirements.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0097b2]/10 text-[#0097b2] mb-6">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Empowerment</h3>
                            <p className="text-gray-600">
                                Empowering citizens with knowledge and tools to make informed decisions about their future.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-20 bg-gradient-to-br from-[#0097b2]/5 via-[#7c3aed]/5 to-[#0097b2]/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0097b2] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                                200+
                            </div>
                            <div className="text-gray-600 font-medium">Universities</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0097b2] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                                100+
                            </div>
                            <div className="text-gray-600 font-medium">Govt Schemes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0097b2] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                                50K+
                            </div>
                            <div className="text-gray-600 font-medium">Citizens Helped</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0097b2] to-[#7c3aed] bg-clip-text text-transparent mb-2">
                                15+
                            </div>
                            <div className="text-gray-600 font-medium">Cities Covered</div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
};

export default AboutPage;
