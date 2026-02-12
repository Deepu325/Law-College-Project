import React from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    icon: Icon = AlertTriangle,
    variant = 'warning'
}) => {
    if (!isOpen) return null;

    const getIconColor = () => {
        switch (variant) {
            case 'danger': return 'text-error-red';
            case 'warning': return 'text-brand-gold';
            case 'success': return 'text-success-green';
            default: return 'text-brand-purple';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 transform animate-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <Icon className={`w-16 h-16 ${getIconColor()} mx-auto mb-4`} />
                    <h2 className="text-2xl font-heading font-bold text-text-dark mb-2">
                        {title}
                    </h2>
                    <div className="text-text-body whitespace-pre-wrap">
                        {message}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 btn-outline disabled:opacity-50 flex items-center justify-center py-3"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center py-3"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
