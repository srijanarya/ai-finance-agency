const axios = require('axios');

const services = [
  { name: 'API Gateway', url: 'http://localhost:3000/health', timeout: 30000 },
  { name: 'User Management', url: 'http://localhost:3002/health', timeout: 30000 },
  { name: 'Payment', url: 'http://localhost:3003/health', timeout: 30000 },
  { name: 'Signals', url: 'http://localhost:3004/health', timeout: 30000 },
  { name: 'Education', url: 'http://localhost:3005/health', timeout: 30000 },
  { name: 'Trading', url: 'http://localhost:3006/health', timeout: 30000 },
  { name: 'Notification', url: 'http://localhost:3007/health', timeout: 30000 },
  { name: 'Market Data', url: 'http://localhost:3008/health', timeout: 30000 },
  { name: 'Content Intelligence', url: 'http://localhost:3009/health', timeout: 30000 },
  { name: 'Risk Management', url: 'http://localhost:3010/health', timeout: 30000 },
];

async function waitForService(service) {
  const startTime = Date.now();
  const maxRetries = Math.floor(service.timeout / 2000); // Retry every 2 seconds
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.get(service.url, {
        timeout: 5000,
        validateStatus: (status) => status === 200,
      });

      if (response.status === 200 && response.data.status === 'ok') {
        const elapsed = Date.now() - startTime;
        console.log(`✅ ${service.name} is ready (${elapsed}ms)`);
        return true;
      }
    } catch (error) {
      // Service not ready yet, continue waiting
    }

    retries++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`❌ ${service.name} failed to become ready within ${service.timeout}ms`);
  return false;
}

async function waitForAllServices() {
  console.log('⏳ Waiting for all services to be ready...');
  
  const results = await Promise.all(
    services.map(service => waitForService(service))
  );

  const readyServices = results.filter(Boolean).length;
  const totalServices = services.length;

  if (readyServices === totalServices) {
    console.log(`🎉 All ${totalServices} services are ready!`);
    process.exit(0);
  } else {
    console.log(`❌ Only ${readyServices}/${totalServices} services are ready`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  waitForAllServices().catch(error => {
    console.error('Error waiting for services:', error);
    process.exit(1);
  });
}

module.exports = { waitForService, waitForAllServices };