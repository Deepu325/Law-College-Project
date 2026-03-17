import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, exportCandidates, getDashboardStats, clearAllData, toggleExamStatus, getExamStatus } from '../api/examApi';
import { Download, Search, LogOut, Users, FileCheck, Clock, CheckCircle, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { formatExamTime } from '../utils/dateFormatter';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [adminRole, setAdminRole] = useState('SUPER_ADMIN');
    const [examStatus, setExamStatus] = useState('active');

    useEffect(() => {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setAdminRole(payload.role || 'ADMIN');
            } catch (e) {
                console.error("Failed to parse token role", e);
            }
        }
        fetchData();
        fetchStatus();
    }, []);

    const fetchData = async () => {
        try {
            const [candidatesRes, statsRes] = await Promise.all([
                getCandidates(),
                getDashboardStats()
            ]);

            setCandidates(candidatesRes.data.candidates);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.status === 401) {
                navigate('/admin/login');
            }
            setLoading(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const { status } = await getExamStatus();
            setExamStatus(status);
        } catch (error) {
            console.error("Failed to fetch exam status", error);
        }
    };

    const handleToggleExamStatus = async () => {
        const newStatus = examStatus === 'paused' ? 'active' : 'paused';
        const msg = newStatus === 'paused' 
            ? "Are you sure you want to PAUSE the exam? Students will see a maintenance screen and cannot register or take the exam."
            : "Are you sure you want to RESUME the exam?";
            
        if (!window.confirm(msg)) return;

        try {
            setLoading(true);
            await toggleExamStatus(newStatus);
            setExamStatus(newStatus);
            alert(`Exam has been ${newStatus.toUpperCase()}`);
            setLoading(false);
        } catch (error) {
            alert("Failed to update exam status");
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await exportCandidates();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `SCLAT_Results_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setExporting(false);
        } catch (error) {
            console.error('Export error:', error);
            setExporting(false);
            alert('Failed to export data');
        }
    };

    const handleClearData = async () => {
        const confirmDelete = window.confirm(
            "⚠️ WARNING: This will PERMANENTLY DELETE all candidate registrations, exam sessions, and responses. \n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?"
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);
            const response = await clearAllData();
            alert(response.message || "All exam data has been cleared.");
            await fetchData(); // Refresh dashboard
        } catch (error) {
            console.error('Clear data error:', error);
            alert('Failed to clear data');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const filteredCandidates = candidates.filter(c =>
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-exam flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-exam flex flex-col font-body">
            <Header
                showLogo={false} // Hidden for admin to keep it clean
                title="Admin Control"
                subtitle={`${adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Dashboard`}
                action={
                    <div className="flex items-center gap-3">
                        {adminRole === 'SUPER_ADMIN' && (
                            <button
                                onClick={handleToggleExamStatus}
                                disabled={loading}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-bold tracking-wide border
                                    ${examStatus === 'paused' 
                                        ? 'bg-success-green/10 text-success-green border-success-green/20 hover:bg-success-green/20' 
                                        : 'bg-red-600/10 text-red-600 border-red-600/20 hover:bg-red-600/20'}`}
                            >
                                {examStatus === 'paused' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                <span className="hidden sm:inline">{examStatus === 'paused' ? 'Resume Exam' : 'Pause Exam'}</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition-colors shadow-sm font-bold tracking-wide"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                }
            />

            <div className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-7xl">
                {/* Stats Cards Dashboard */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5 mb-8">
                        {/* Total Registrations */}
                        <div className="card bg-white border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reg.</p>
                                    <p className="text-2xl md:text-3xl font-black text-brand-purple">{stats.totalRegistrations}</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Users className="w-6 h-6 text-brand-purple" />
                                </div>
                            </div>
                        </div>

                        {/* Submitted */}
                        <div className="card bg-white border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Submitted</p>
                                    <p className="text-2xl md:text-3xl font-black text-success-green">{stats.totalSubmissions}</p>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <FileCheck className="w-6 h-6 text-success-green" />
                                </div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="card bg-white border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">In Progress</p>
                                    <p className="text-2xl md:text-3xl font-black text-yellow-600">{stats.inProgress}</p>
                                </div>
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        {/* Average Score */}
                        <div className="card bg-white border border-gray-100 hover:shadow-lg transition-transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Score</p>
                                    <p className="text-2xl md:text-3xl font-black text-brand-purple">{(stats.averageScore || 0).toFixed(1)}</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <FileCheck className="w-6 h-6 text-brand-purple" />
                                </div>
                            </div>
                        </div>

                        {/* Super Admin Logins */}
                        <div className="card bg-white border-2 border-brand-purple/20 hover:shadow-lg transition-transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-1">Super Admin Login</p>
                                    <p className="text-2xl md:text-3xl font-black text-brand-purple">
                                        {stats.adminStats?.find(a => a.email?.toLowerCase() === 'sa-sclat_admin@soundarya.edu')?.loginCount || 0}
                                    </p>
                                </div>
                                <div className="p-2 bg-brand-purple text-white rounded-lg shadow-sm">
                                    <Lock className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Normal Admin Logins */}
                        <div className="card bg-white border-2 border-brand-purple/20 hover:shadow-lg transition-transform hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-1">Normal Admin Login</p>
                                    <p className="text-2xl md:text-3xl font-black text-brand-purple">
                                        {stats.adminStats?.find(a => a.email?.toLowerCase() === 'sclat_admin@soundarya.edu')?.loginCount || 0}
                                    </p>
                                </div>
                                <div className="p-2 bg-brand-purple/60 text-white rounded-lg shadow-sm">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Admin Login Tracking - Special Feature */}
                {stats && stats.adminStats && (
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-brand-purple/10 rounded-lg">
                                <Lock className="w-5 h-5 text-brand-purple" />
                            </div>
                            <h2 className="text-xl font-heading font-extrabold text-brand-purple tracking-tight">
                                Administrator Login Activity
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.adminStats.map((admin, idx) => (
                                <div key={idx} className="card bg-white border border-gray-100 p-5 hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-black text-brand-purple truncate max-w-[200px]">{admin.email}</p>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-brand-purple' : 'bg-gray-100 text-gray-500'}`}>
                                                {admin.role}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-brand-purple/5 transition-colors">
                                            <Users className="w-5 h-5 text-gray-400 group-hover:text-brand-purple" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Logins</span>
                                            <span className="text-lg font-black text-brand-purple">{admin.loginCount}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Login Activity</span>
                                            <span className="text-[11px] font-mono font-medium text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                                {admin.lastLogin ? formatExamTime(admin.lastLogin) : 'Never logged in'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Candidates Table Component */}
                <div className="card-exam bg-white overflow-hidden p-0 sm:p-0 md:p-0">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-100">
                        <h2 className="text-xl md:text-2xl font-heading font-extrabold text-brand-purple flex items-center gap-3 w-full md:w-auto">
                            <Users className="w-6 h-6" />
                            Candidate Database
                        </h2>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
                            {/* Search Filter */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-purple/50" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10 bg-gray-50 focus:bg-white w-full border-gray-200"
                                />
                            </div>

                            {/* Export Data Button */}
                            <button
                                onClick={handleExport}
                                disabled={exporting || candidates.length === 0}
                                className="btn-primary bg-success-green hover:bg-green-700 flex justify-center items-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-md min-h-[44px]"
                            >
                                <Download className="w-4 h-4" />
                                <span className="font-bold">{exporting ? 'Exporting...' : 'Export CSV'}</span>
                            </button>

                            {/* Super Admin Only: Clear Data Button */}
                            {adminRole === 'SUPER_ADMIN' && (
                                <button
                                    onClick={handleClearData}
                                    disabled={loading}
                                    className="btn-primary bg-red-600 hover:bg-red-700 flex justify-center items-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-md min-h-[44px]"
                                    title="Clear all registrations and results"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="font-bold">Clear All</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredCandidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-lg font-bold text-gray-600 mb-1">No candidates found</p>
                            <p className="text-sm text-gray-400">Try adjusting your search query to find candidates.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
                            <table className="admin-table text-left">
                                <thead className="bg-brand-purple border-y border-brand-purple">
                                    <tr>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4">#</th>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4 min-w-[180px]">
                                            Contact Info
                                        </th>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4 min-w-[150px]">
                                            Location
                                        </th>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4">
                                            Program
                                        </th>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4 text-center">
                                            Score
                                        </th>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4 text-center">
                                            Status
                                        </th>
                                        <th className="font-bold text-white uppercase tracking-widest text-xs py-4 px-4 min-w-[160px]">
                                            Activity Logs
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCandidates.map((candidate, index) => (
                                        <tr key={candidate.sessionId} className="group hover:bg-purple-50/30 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-400">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-extrabold text-brand-purple text-base mb-1">{candidate.fullName}</div>
                                                <div className="text-xs text-text-body font-mono font-medium">{candidate.email}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{candidate.phone}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-gray-700 text-sm mb-1">{candidate.city}</div>
                                                <div className="text-xs text-gray-400 uppercase font-bold tracking-tight">{candidate.state}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold leading-none bg-purple-50 border border-purple-100 text-purple-700">
                                                    {candidate.qualification}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center align-middle">
                                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-200">
                                                    <span className="font-black text-brand-purple text-base">
                                                        {candidate.score !== undefined ? candidate.score : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center align-middle">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide
                                                    ${candidate.status === 'submitted'
                                                        ? 'bg-success-green text-white'
                                                        : 'bg-yellow-500 text-white'
                                                    }`}>
                                                    {candidate.status === 'submitted' && <CheckCircle className="w-3 h-3"/>}
                                                    {candidate.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs font-mono font-medium text-gray-600">
                                                <div className="mb-1 flex gap-2">
                                                    <span className="text-green-600 font-bold shrink-0">Started:</span> 
                                                    {formatExamTime(candidate.exam_started_at)}
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-gray-400 font-bold shrink-0">Ended :</span> 
                                                    {candidate.submittedAt ? formatExamTime(candidate.submittedAt) : 'N/A'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SuperAdminDashboard;
