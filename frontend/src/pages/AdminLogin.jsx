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
                localStorage.setItem('adminToken', response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-bg-exam flex flex-col">
            <Header showLogo={true} />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-heading font-bold text-brand-purple mb-2">
                            Admin Login
                        </h1>
                        <p className="text-text-body">SLET Examination System</p>
                    </div>

                    <div className="card-exam">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-error-red p-4 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-error-red mr-3 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field pl-11"
                                        placeholder="admin@college.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-text-dark mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field pl-11"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => navigate('/')}
                            className="text-brand-purple hover:underline text-sm"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AdminLogin;
