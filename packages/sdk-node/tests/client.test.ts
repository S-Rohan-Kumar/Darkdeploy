import { DarkDeployClient } from '../src/client.js';

describe('DarkDeployClient (Node SDK)', () => {
  it('throws an error if apiKey is not provided', () => {
    expect(() => {
      new DarkDeployClient({ apiKey: '' });
    }).toThrow('DarkDeployClient requires an apiKey');
  });

  it('returns default value for non-existent flags safely without throwing', () => {
    const client = new DarkDeployClient({ apiKey: 'mock_key' });

    const result = client.isEnabled('unknown-flag', { id: 'usr_1' }, false);
    expect(result).toBe(false);

    const customDefault = client.isEnabled('unknown-flag', { id: 'usr_1' }, true);
    expect(customDefault).toBe(true);
  });
});