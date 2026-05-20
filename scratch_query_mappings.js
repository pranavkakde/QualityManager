const axios = require('axios');

async function testMappingsEndpoint() {
    try {
        console.log('Sending request to DefectManagementServices directly on port 7779...');
        const res = await axios.get('http://localhost:7779/defect-testcases/all', {
            headers: {
                'Authorization': 'Bearer demo-token-jwt'
            }
        });
        console.log('Response Status:', res.status);
        console.log('Response Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Error fetching directly:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    }
}

testMappingsEndpoint();
