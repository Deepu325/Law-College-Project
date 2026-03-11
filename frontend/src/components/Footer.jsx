import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <>
        <footer className="bg-brand-purple text-white py-8 shadow-md mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Programs */}
                    <div>
                        <h3 className="font-bold text-lg text-yellow-400 mb-3">Programs</h3>
                        <ul className="text-white text-sm space-y-2">
                            <li>B.A.LL.B</li>
                            <li>B.Com.LL.B</li>
                            <li>LL.B</li>
                            <li>Value Added Programs</li>
                        </ul>
                    </div>

                    {/* Work Hours */}
                    <div>
                        <h3 className="font-bold text-lg text-yellow-400 mb-3">Work Hours</h3>
                        <ul className="text-white text-sm space-y-2">
                            <li>8:30 AM - 4:30 PM</li>
                            <li>Monday - Friday</li>
                            <li className="mt-2">8:30 AM - 1 PM</li>
                            <li>Saturday</li>
                        </ul>
                    </div>

                    {/* Contacts */}
                    <div>
                        <h3 className="font-bold text-lg text-yellow-400 mb-3">Contact Us</h3>                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-400 text-sm font-semibold">Give Us A Call</p>
                                    <p className="text-white text-sm">+91 6269000092</p>
                                    <p className="text-white text-sm">+91 6269000093</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* More Contact Info */}
                    <div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-400 text-sm font-semibold">Send Us A Message</p>
                                    <p className="text-white text-xs">scl.principal@soundaryainstitutions.in</p>
                                    <p className="text-white text-xs">scl.viceprincipal@soundaryainstitutions.in</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-yellow-400 text-sm font-semibold">Office Location</p>
                                    <p className="text-white text-xs">Soundaryanagar, Sidedahalli,<br />Nagasandra Post,<br />Bangalore-560073</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-yellow-400 pt-4">
                    <p className="text-center text-white text-sm">
                        © {currentYear} Soundarya College of Law. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
        <div className="bg-white py-3">
            <p className="text-center text-gray-700 text-xs">
                Developed and Deployed by Deepu KC (SIMS)
            </p>
        </div>
        </>
    );
};

export default Footer;
