import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, exportCandidates, getDashboardStats } from '../api/examApi';
import { Download, Search, LogOut, Users, FileCheck, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchData();
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

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
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
        <div className="min-h-screen bg-bg-exam">
            {/* Header */}
            <div className="bg-brand-purple text-white py-6 shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
                            <p className="text-purple-200 mt-1">S-CLAT Examination System</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-white text-brand-purple px-6 py-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="card bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-body mb-1">Total Registrations</p>
                                    <p className="text-3xl font-bold text-brand-purple">{stats.totalRegistrations}</p>
                                </div>
                                <Users className="w-12 h-12 text-brand-purple opacity-20" />
                            </div>
                        </div>

                        <div className="card bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-body mb-1">Submitted</p>
                                    <p className="text-3xl font-bold text-success-green">{stats.totalSubmissions}</p>
                                </div>
                                <FileCheck className="w-12 h-12 text-success-green opacity-20" />
                            </div>
                        </div>

                        <div className="card bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-body mb-1">In Progress</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                                </div>
                                <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
                            </div>
                        </div>

                        <div className="card bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-body mb-1">Average Score</p>
                                    <p className="text-3xl font-bold text-brand-purple">{stats.averageScore}</p>
                                </div>
                                <FileCheck className="w-12 h-12 text-brand-purple opacity-20" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Candidates Table */}
                <div className="card bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-heading font-bold text-text-dark">Candidates</h2>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search candidates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-11 w-64"
                                />
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={handleExport}
                                disabled={exporting || candidates.length === 0}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {exporting ? 'Exporting...' : 'Export Excel'}
                            </button>
                        </div>
                    </div>

                    {filteredCandidates.length === 0 ? (
                        <p className="text-center text-text-body py-8">No candidates found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Qualification</th>
                                        <th>City</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                        <th>Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.map((candidate, index) => (
                                        <tr key={candidate.sessionId}>
                                            <td>{index + 1}</td>
                                            <td className="font-semibold">{candidate.fullName}</td>
                                            <td>{candidate.email}</td>
                                            <td>{candidate.phone}</td>
                                            <td>{candidate.qualification}</td>
                                            <td>{candidate.city}</td>
                                            <td>
                                                <span className="font-bold text-brand-purple">
                                                    {candidate.score !== undefined ? candidate.score : '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${candidate.status === 'SUBMITTED'
                                                        ? 'bg-success-green text-white'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {candidate.status}
                                                </span>
                                            </td>
                                            <td>
                                                {candidate.submittedAt
                                                    ? new Date(candidate.submittedAt).toLocaleString('en-IN')
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
