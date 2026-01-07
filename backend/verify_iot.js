const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';
let propertyId = '';
let deviceId = '';

async function runVerification() {
    try {
        console.log('🚀 Starting IoT Module Verification...');

        // 1. Login as Admin to get token
        console.log('\n1. Logging in...');
        // Assuming there is a default admin or I can create one. 
        // Or I can use the registration endpoint if needed.
        // Let's try to register a new admin for testing purposes or use existing credentials if known.
        // Since I don't know existing creds, I'll try to register a temp user.
        const uniqueId = Date.now();
        const email = `testadmin${uniqueId}@example.com`;
        const password = 'password123';

        try {
            await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Admin',
                email,
                password,
                role: 'admin',
                phone: '+1234567890'
            });
        } catch (e) {
            // If registration fails (maybe email exists), try login
        }

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        token = loginRes.data.token;
        console.log('✅ Login successful');

        // 2. Create a Property (needed for device)
        console.log('\n2. Creating Test Property...');
        const propRes = await axios.post(`${API_URL}/properties`, {
            name: `Test Property ${uniqueId}`,
            address: '123 Test Lane',
            managerId: loginRes.data.user.id // Assign to self for simplicity
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        propertyId = propRes.data._id;
        console.log('✅ Property created:', propertyId);

        // 3. Register a Device
        console.log('\n3. Registering Device...');
        const deviceRes = await axios.post(`${API_URL}/devices`, {
            serialNumber: `DEV-${uniqueId}`,
            type: 'camera',
            assignedProperty: propertyId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        deviceId = deviceRes.data._id;
        console.log('✅ Device registered:', deviceRes.data.serialNumber);

        // 4. Send Heartbeat (Public Endpoint)
        console.log('\n4. Sending Heartbeat...');
        await axios.post(`${API_URL}/devices/heartbeat`, {
            serialNumber: `DEV-${uniqueId}`,
            batteryLevel: 85,
            signalStrength: 90
        });
        console.log('✅ Heartbeat sent');

        // 5. Verify Device Status
        console.log('\n5. Verifying Device Status...');
        const getDeviceRes = await axios.get(`${API_URL}/devices/${deviceId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (getDeviceRes.data.status === 'online' && getDeviceRes.data.batteryLevel === 85) {
            console.log('✅ Device status verified: ONLINE');
        } else {
            console.error('❌ Device status verification failed:', getDeviceRes.data);
            process.exit(1);
        }

        console.log('\n🎉 Verification Complete! IoT Module is working.');

    } catch (error) {
        console.error('❌ Verification Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runVerification();
