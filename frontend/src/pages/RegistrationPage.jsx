import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../api/examApi';
import { useExam } from '../context/ExamContext';
import { AlertCircle, Loader, User, Mail, Phone, MapPin, Building, BookOpen } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const RegistrationPage = () => {
    const navigate = useNavigate();
    const { initializeExam, sessionData, examConfig } = useExam();

    const now = new Date();
    const startTime = examConfig ? new Date(examConfig.startTime) : null;
    const stopTime = examConfig ? new Date(examConfig.stopTime) : null;

    const isBefore = startTime && now < startTime;
    const isAfter = stopTime && now > stopTime;

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Redirect if already registered/active
    React.useEffect(() => {
        if (sessionData && sessionData.status !== 'submitted') {
            navigate('/exam');
        }
    }, [sessionData, navigate]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        qualification: '',
        state: '',
        city: '',
        consent: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }

        if (!formData.qualification.trim()) {
            newErrors.qualification = 'Course Applied is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.consent) {
            newErrors.consent = 'You must provide consent to proceed';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await registerStudent(formData);

            if (response.success) {
                if (response.isResume) {
                    setApiError('');
                    const confirmMsg = "Your exam is already in progress. You will now be redirected to resume the exam.";
                    initializeExam(response.data);
                    alert(confirmMsg);
                    navigate('/exam');
                    return;
                }

                await initializeExam(response.data);
                navigate('/exam');
            }
        } catch (error) {
            setLoading(false);

            if (error.data?.duplicateAttempt) {
                setApiError(error.data.reason || 'Test already taken with this email or phone number.');
            } else {
                setApiError(error.message || 'Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-bg-exam flex flex-col font-body">
            <Header showLogo={true} />

            <div className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="card-exam bg-white shadow-xl rounded-2xl border-t-4 border-t-brand-purple overflow-hidden">
                        
                        {/* Header Details */}
                        <div className="bg-purple-50 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 mb-8 p-6 sm:p-8 text-center border-b border-purple-100">
                            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-purple tracking-tight">Candidate Registration</h2>
                            <p className="text-sm sm:text-base text-gray-500 mt-2 font-medium">Please fill in your details accurately to proceed.</p>
                        </div>

                        {apiError && (
                            <div className="bg-red-50 border-l-4 border-error-red p-4 rounded-r-lg mb-8 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-100 p-1.5 rounded-full flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-error-red" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-error-red text-sm uppercase tracking-wider mb-1">Registration Failed</p>
                                        <p className="text-sm text-red-700 font-medium leading-relaxed">{apiError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isBefore && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-800 text-sm uppercase tracking-wider mb-1">Exam Not Started</p>
                                        <p className="text-sm text-blue-700 font-medium">Please come back at {formatDate(startTime)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAfter && (
                            <div className="bg-red-50 border-l-4 border-error-red p-4 rounded-r-lg mb-8 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-100 p-1.5 rounded-full flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-error-red" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-800 text-sm uppercase tracking-wider mb-1">Exam Ended</p>
                                        <p className="text-sm text-red-700 font-medium">The exam session has closed.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {/* Full Name */}
                                <div className="md:col-span-2">
                                    <label htmlFor="fullName" className="block text-sm font-bold text-text-dark mb-2 uppercase tracking-wide">
                                        Full Name <span className="text-error-red">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className={`input-field pl-11 bg-gray-50 focus:bg-white text-base py-3 ${errors.fullName ? 'input-error ring-1 ring-error-red' : ''}`}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-error-red text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.fullName}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-text-dark mb-2 uppercase tracking-wide">
                                        Email Address <span className="text-error-red">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`input-field pl-11 bg-gray-50 focus:bg-white text-base py-3 ${errors.email ? 'input-error ring-1 ring-error-red' : ''}`}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-error-red text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.email}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-bold text-text-dark mb-2 uppercase tracking-wide">
                                        Phone Number <span className="text-error-red">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength="10"
                                            className={`input-field pl-11 bg-gray-50 focus:bg-white text-base py-3 ${errors.phone ? 'input-error ring-1 ring-error-red' : ''}`}
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-error-red text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.phone}</p>}
                                </div>

                                {/* Course Applied */}
                                <div className="md:col-span-2">
                                    <label htmlFor="qualification" className="block text-sm font-bold text-text-dark mb-2 uppercase tracking-wide">
                                        Course Applied <span className="text-error-red">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors z-10">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <select
                                            id="qualification"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            className={`input-field pl-11 bg-gray-50 focus:bg-white text-base py-3 appearance-none ${errors.qualification ? 'input-error ring-1 ring-error-red' : ''}`}
                                        >
                                            <option value="">Select a Program</option>
                                            <option value="B.A. LL.B">B.A. LL.B</option>
                                            <option value="B.Com. LL.B">B.Com. LL.B</option>
                                            <option value="LL.B">LL.B</option>
                                        </select>
                                    </div>
                                    {errors.qualification && <p className="text-error-red text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.qualification}</p>}
                                </div>

                                {/* State */}
                                <div>
                                    <label htmlFor="state" className="block text-sm font-bold text-text-dark mb-2 uppercase tracking-wide">
                                        State <span className="text-error-red">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors z-10">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className={`input-field pl-11 bg-gray-50 focus:bg-white text-base py-3 appearance-none ${errors.state ? 'input-error ring-1 ring-error-red' : ''}`}
                                        >
                                            <option value="">Select a State</option>
                                            {INDIAN_STATES.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.state && <p className="text-error-red text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.state}</p>}
                                </div>

                                {/* City */}
                                <div>
                                    <label htmlFor="city" className="block text-sm font-bold text-text-dark mb-2 uppercase tracking-wide">
                                        City <span className="text-error-red">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors">
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            disabled={!formData.state}
                                            className={`input-field pl-11 bg-gray-50 focus:bg-white text-base py-3 ${errors.city ? 'input-error ring-1 ring-error-red' : ''} ${!formData.state ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                            placeholder={formData.state ? "Enter your city" : "Select state first"}
                                        />
                                    </div>
                                    {errors.city && <p className="text-error-red text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.city}</p>}
                                </div>
                            </div>

                            {/* Consent Checkbox */}
                            <div className="bg-purple-50 p-4 sm:p-5 rounded-xl border border-purple-100 shadow-sm mt-8">
                                <label className="flex items-start cursor-pointer group">
                                    <div className="relative flex-shrink-0 mt-0.5 mr-4">
                                        <input
                                            type="checkbox"
                                            name="consent"
                                            checked={formData.consent}
                                            onChange={handleChange}
                                            className="peer h-6 w-6 cursor-pointer appearance-none rounded border-2 border-purple-300 bg-white transition-all checked:bg-brand-purple checked:border-brand-purple hover:border-brand-purple focus:ring-2 focus:ring-brand-purple focus:ring-offset-1"
                                        />
                                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white fill-current transition-opacity duration-200" viewBox="0 0 20 20">
                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" fillRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span className="text-sm md:text-base text-gray-700 font-medium leading-relaxed select-none group-hover:text-text-dark transition-colors">
                                        I hereby declare that the information provided is accurate and I understand that this exam can be attempted only once. I consent to the processing of my data for examination purposes.
                                        <span className="text-error-red ml-1 font-bold">*</span>
                                    </span>
                                </label>
                                {errors.consent && (
                                    <p className="text-error-red text-sm mt-3 ml-10 font-bold flex items-center gap-1"><AlertCircle className="w-4 h-4"/>{errors.consent}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 pb-2">
                                <button
                                    type="submit"
                                    disabled={loading || isBefore || isAfter}
                                    className="w-full relative inline-flex items-center justify-center min-h-[56px] px-8 py-4 overflow-hidden font-bold text-white bg-brand-purple rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                >
                                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <Loader className="w-6 h-6 animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            'Register & Start Exam'
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-8 pb-8">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-purple transition-colors font-bold uppercase tracking-wider text-sm px-4 py-2 rounded-lg hover:bg-gray-100"
                        >
                            <span className="text-lg leading-none mb-1">←</span> Back to Instructions
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RegistrationPage;
