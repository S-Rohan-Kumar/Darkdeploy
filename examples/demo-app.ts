import { DarkDeployClient } from '@darkdeploy/node-sdk';

const API_KEY = process.env.DARKDEPLOY_API_KEY || 'dd_dev_d934289e58292e134bcde54fbf153aa7';

async function main() {
  console.log('========================================================');
  console.log('🚀 DarkDeploy Demo Application Running');
  console.log('========================================================\n');

  const client = new DarkDeployClient({
    apiKey: API_KEY,
    baseUrl: process.env.DARKDEPLOY_URL || 'https://darkdeploy-api.onrender.com',
  });

  await client.initialize();
  console.log('✅ SDK initialized & listening for live flag events.\n');

  const enterpriseUser = {
    id: 'user_enterprise_99',
    attributes: { plan: 'enterprise', country: 'IN' },
  };

  const freeUser = {
    id: 'user_free_12',
    attributes: { plan: 'free', country: 'US' },
  };

  setInterval(() => {
    const enterpriseResult = client.evaluate('new-checkout-flow', enterpriseUser);
    const freeResult = client.evaluate('new-checkout-flow', freeUser);

    const timestamp = new Date().toLocaleTimeString();

    const entStatus = enterpriseResult?.value ? '🟢 ON ' : '🔴 OFF';
    const freeStatus = freeResult?.value ? '🟢 ON ' : '🔴 OFF';

    console.log(
      `[${timestamp}] ` +
      `Enterprise User: ${entStatus} (${enterpriseResult?.reason || 'NOT_FOUND'}) | ` +
      `Free User: ${freeStatus} (${freeResult?.reason || 'NOT_FOUND'})`
    );
  }, 2000);
}

main().catch(console.error);
