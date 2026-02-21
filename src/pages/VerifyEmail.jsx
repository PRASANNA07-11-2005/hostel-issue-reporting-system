import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const { verifyEmail } = useAuth();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('pending');
    const navigate = useNavigate();

    useEffect(() => {
        const oobCode = searchParams.get('oobCode');
        if (!oobCode) {
            setStatus('invalid');
            return;
        }
        verifyEmail(oobCode)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [searchParams, verifyEmail]);

    let message;
    if (status === 'pending') message = 'Verifying your email...';
    if (status === 'success') message = 'Email verified! You may now login.';
    if (status === 'error') message = 'Verification failed, please try again.';
    if (status === 'invalid') message = 'No verification code provided.';

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow">
                <p>{message}</p>
                {status === 'success' && (
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded"
                    >
                        Go to login
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
