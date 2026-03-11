import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/examApi';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);

        try {
            const response = await adminLogin(formData);

            if (response.success) {
                sessionStorage.setItem('adminToken', response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-bg-exam flex flex-col font-body">
            <Header showLogo={true} />

            <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-md w-full relative z-10">
                    <div className="text-center mb-8 sm:mb-10">
                        <span className="inline-block px-3 py-1 mb-3 bg-purple-100 text-brand-purple rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                            Restricted Access
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-brand-purple mb-2 tracking-tight">
                            Admin Login
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 font-medium tracking-wide">SLET Examination System Control Panel</p>
                    </div>

                    <div className="card-exam bg-white shadow-xl rounded-2xl border-t-4 border-brand-purple p-6 sm:p-8">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-error-red p-4 rounded-r-lg mb-6 sm:mb-8 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-100 p-1 rounded-full flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-error-red" />
                                    </div>
                                    <p className="text-sm text-red-700 font-bold leading-relaxed">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field pl-12 bg-gray-50 focus:bg-white text-base py-3 sm:py-4 transition-all"
                                        placeholder="admin@college.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field pl-12 bg-gray-50 focus:bg-white text-base py-3 sm:py-4 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative inline-flex items-center justify-center min-h-[56px] px-8 py-4 overflow-hidden font-bold text-white bg-brand-purple rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-lg sm:text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-2"
                            >
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                                <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                                    {loading ? (
                                        <>
                                            <Loader className="w-6 h-6 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        'Access Control Panel'
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>

                    <div className="text-center mt-8 pb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-purple transition-colors font-bold uppercase tracking-widest text-xs px-4 py-2"
                        >
                            <span className="text-sm leading-none -mt-0.5">&larr;</span> Return to Website
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AdminLogin;
