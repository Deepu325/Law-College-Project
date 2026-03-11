require('dotenv').config();

const test = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@college.edu',
                password: 'admin12345'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);

        const token = loginData.data.token;
        console.log('Login successful, token received.');

        // 2. Check Stats
        console.log('Checking stats...');
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        console.log('Stats Data:', JSON.stringify(statsData.data));

        // 3. Export
        console.log('Calling export endpoint...');
        const exportRes = await fetch('http://localhost:5000/api/admin/export', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Export response status:', exportRes.status);
        if (!exportRes.ok) {
            const errorMsg = await exportRes.text();
            console.error('Error body:', errorMsg);
        } else {
            console.log('Export successful!');
        }

    } catch (err) {
        console.error('Test failed:', err.message);
    }
    process.exit(0);
};

test();
