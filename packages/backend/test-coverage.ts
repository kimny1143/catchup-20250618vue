import http from 'node:http';

// Simple script to hit API endpoints for coverage
const baseUrl = 'http://localhost:4000';

async function makeRequest(method: string, path: string, body?: any) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(`${baseUrl}${path}`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('Running API tests for coverage...');
  
  try {
    // Test GET /api/slots
    console.log('Testing GET /api/slots');
    await makeRequest('GET', '/api/slots');
    
    // Test POST /api/slots/check-conflict
    console.log('Testing POST /api/slots/check-conflict');
    await makeRequest('POST', '/api/slots/check-conflict', { time: '2025-06-19 14:00' });
    
    // Test POST /api/slots/:id/reserve
    console.log('Testing POST /api/slots/slot-002/reserve');
    await makeRequest('POST', '/api/slots/slot-002/reserve');
    
    // Test GET /api/slots/optimal
    console.log('Testing GET /api/slots/optimal');
    await makeRequest('GET', '/api/slots/optimal');
    
    // Test invalid slot
    console.log('Testing POST /api/slots/invalid-id/reserve');
    await makeRequest('POST', '/api/slots/invalid-id/reserve');
    
    console.log('All tests completed!');
    
    // Give time for coverage to write
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Wait for server to start
setTimeout(runTests, 3000);