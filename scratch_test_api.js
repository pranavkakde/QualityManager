const axios = require('axios');

async function testReleaseSuites() {
    try {
        console.log('Sending request to Nginx gateway on port 80...');
        const res = await axios.get('http://localhost/api/release/release/1/testsuites', {
            headers: {
                'Authorization': 'Bearer demo-token-jwt'
            }
        });
        console.log('Gateway Response Status:', res.status);
        console.log('Gateway Response Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error fetching via gateway:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    }
}

testReleaseSuites();
