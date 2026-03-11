import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../api/examApi';
import { useExam } from '../context/ExamContext';
import { AlertCircle, Loader } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const RegistrationPage = () => {
    const navigate = useNavigate();
    const { initializeExam, sessionData } = useExam();

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

        // Clear error for this field
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
                // Case 2: Resume in progress
                if (response.isResume) {
                    setApiError(''); // Clear any errors
                    // Show a temporary success message
                    const confirmMsg = "Your exam is already in progress. You will now be redirected to resume the exam.";
                    initializeExam(response.data);
                    alert(confirmMsg); // Or use a nicer Toast later
                    navigate('/exam');
                    return;
                }

                // Case 1: Fresh start
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
        <div className="min-h-screen bg-bg-exam flex flex-col">
            <Header showLogo={true} />

            <div className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-2xl">

                    {/* Registration Form Card */}
                    <div className="card-exam">
                        {/* API Error Alert */}
                        {apiError && (
                            <div className="bg-red-50 border-l-4 border-error-red p-4 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-error-red mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-error-red">Registration Failed</p>
                                        <p className="text-sm text-red-700 mt-1">{apiError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold text-text-dark mb-2">
                                    Full Name <span className="text-error-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                                    placeholder="Enter your full name"
                                />
                                {errors.fullName && (
                                    <p className="text-error-red text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-text-dark mb-2">
                                    Email Address <span className="text-error-red">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && (
                                    <p className="text-error-red text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-text-dark mb-2">
                                    Phone Number <span className="text-error-red">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength="10"
                                    className={`input-field ${errors.phone ? 'input-error' : ''}`}
                                    placeholder="10-digit mobile number"
                                />
                                {errors.phone && (
                                    <p className="text-error-red text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Course Applied */}
                            <div>
                                <label htmlFor="qualification" className="block text-sm font-semibold text-text-dark mb-2">
                                    Course Applied <span className="text-error-red">*</span>
                                </label>
                                <select
                                    id="qualification"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className={`input-field ${errors.qualification ? 'input-error' : ''}`}
                                >
                                    <option value="">Select a Program</option>
                                    <option value="B.A. LL.B">B.A. LL.B</option>
                                    <option value="B.Com. LL.B">B.Com. LL.B</option>
                                    <option value="LL.B">LL.B</option>
                                </select>
                                {errors.qualification && (
                                    <p className="text-error-red text-sm mt-1">{errors.qualification}</p>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <label htmlFor="state" className="block text-sm font-semibold text-text-dark mb-2">
                                    State <span className="text-error-red">*</span>
                                </label>
                                <select
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className={`input-field ${errors.state ? 'input-error' : ''}`}
                                >
                                    <option value="">Select a State</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                {errors.state && (
                                    <p className="text-error-red text-sm mt-1">{errors.state}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-semibold text-text-dark mb-2">
                                    City <span className="text-error-red">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!formData.state}
                                    className={`input-field ${errors.city ? 'input-error' : ''} ${!formData.state ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder={formData.state ? "Enter your city" : "Select state first"}
                                />
                                {errors.city && (
                                    <p className="text-error-red text-sm mt-1">{errors.city}</p>
                                )}
                            </div>

                            {/* Consent Checkbox */}
                            <div className="bg-gray-50 p-4 rounded-md">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="consent"
                                        checked={formData.consent}
                                        onChange={handleChange}
                                        className="mt-1 mr-3 w-5 h-5 text-brand-purple focus:ring-brand-purple border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-text-body">
                                        I hereby declare that the information provided is accurate and I understand that this exam can be attempted only once. I consent to the processing of my data for examination purposes.
                                        <span className="text-error-red ml-1">*</span>
                                    </span>
                                </label>
                                {errors.consent && (
                                    <p className="text-error-red text-sm mt-2 ml-8">{errors.consent}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary text-lg py-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                                            Registering...
                                        </>
                                    ) : (
                                        'Register & Start Exam'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => navigate('/')}
                            className="text-brand-purple hover:underline text-sm"
                        >
                            ← Back to Instructions
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default RegistrationPage;
