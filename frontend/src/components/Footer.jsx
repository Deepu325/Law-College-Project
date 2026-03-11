import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto shadow-inner bg-brand-purple text-white relative">
            {/* Top decorative border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 pb-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-8 lg:gap-10 mb-10">
                    {/* Programs */}
                    <div className="space-y-4">
                        <h3 className="font-heading font-bold text-xl text-yellow-400 border-b border-purple-800 pb-2 inline-block">
                            Programs
                        </h3>
                        <ul className="text-gray-200 text-sm md:text-base space-y-3 font-medium">
                            <li className="hover:text-yellow-400 transition-colors duration-200 cursor-pointer flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                                B.A. LL.B
                            </li>
                            <li className="hover:text-yellow-400 transition-colors duration-200 cursor-pointer flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                                B.Com. LL.B
                            </li>
                            <li className="hover:text-yellow-400 transition-colors duration-200 cursor-pointer flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                                LL.B
                            </li>
                            <li className="hover:text-yellow-400 transition-colors duration-200 cursor-pointer flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                                Value Added Programs
                            </li>
                        </ul>
                    </div>

                    {/* Work Hours */}
                    <div className="space-y-4">
                        <h3 className="font-heading font-bold text-xl text-yellow-400 border-b border-purple-800 pb-2 inline-block">
                            Work Hours
                        </h3>
                        <div className="text-gray-200 text-sm md:text-base space-y-4 font-medium">
                            <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-800/50">
                                <p className="text-yellow-400 font-semibold mb-1">Monday - Friday</p>
                                <p>8:30 AM - 4:30 PM</p>
                            </div>
                            <div className="bg-purple-900/40 p-3 rounded-lg border border-purple-800/50">
                                <p className="text-yellow-400 font-semibold mb-1">Saturday</p>
                                <p>8:30 AM - 1:00 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-4">
                        <h3 className="font-heading font-bold text-xl text-yellow-400 border-b border-purple-800 pb-2 inline-block">
                            Contact Us
                        </h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-900/30 transition-colors">
                                <div className="bg-purple-800 p-2 rounded-full flex-shrink-0">
                                    <Phone className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-yellow-400 text-sm font-semibold tracking-wide uppercase">Give Us A Call</p>
                                    <p className="text-gray-200 text-sm md:text-base font-medium">
                                        <a href="tel:+916269000092" className="hover:text-white transition-colors block py-0.5">+91 6269000092</a>
                                        <a href="tel:+916269000093" className="hover:text-white transition-colors block py-0.5">+91 6269000093</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* More Contact Info */}
                    <div className="space-y-4">
                        <h3 className="font-heading font-bold text-xl text-yellow-400 border-b border-purple-800 pb-2 inline-block lg:invisible">
                            Let's Connect
                        </h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-900/30 transition-colors">
                                <div className="bg-purple-800 p-2 rounded-full flex-shrink-0">
                                    <Mail className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-yellow-400 text-sm font-semibold tracking-wide uppercase">Send Us A Message</p>
                                    <p className="text-gray-200 text-xs sm:text-sm font-medium break-all">
                                        <a href="mailto:scl.principal@soundaryainstitutions.in" className="hover:text-white transition-colors block py-0.5">scl.principal@soundaryainstitutions.in</a>
                                        <a href="mailto:scl.viceprincipal@soundaryainstitutions.in" className="hover:text-white transition-colors block py-0.5 mt-1">scl.viceprincipal@soundaryainstitutions.in</a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-900/30 transition-colors">
                                <div className="bg-purple-800 p-2 rounded-full flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-yellow-400 text-sm font-semibold tracking-wide uppercase">Office Location</p>
                                    <address className="text-gray-200 text-xs sm:text-sm font-medium not-italic leading-relaxed">
                                        Soundaryanagar, Sidedahalli,<br />
                                        Nagasandra Post,<br />
                                        Bangalore-560073
                                    </address>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-purple-800/60 pt-6 mt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-center md:text-left text-purple-200 text-xs sm:text-sm font-medium">
                            &copy; {currentYear} Soundarya College of Law. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Developer Banner */}
            <div className="bg-gray-100 py-3 px-4 border-t border-gray-200">
                <p className="text-center text-gray-600 text-[10px] sm:text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
                    Developed and Deployed by Deepu KC (SIMS)
                </p>
            </div>
        </footer>
    );
};

export default Footer;
