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

  it('returns null for non-existent experiments safely without throwing', () => {
    const client = new DarkDeployClient({ apiKey: 'mock_key' });

    const variant = client.getVariant('unknown-experiment', { id: 'usr_1' });
    expect(variant).toBeNull();
  });

  it('returns fallback AI config or null for non-existent flags', () => {
    const client = new DarkDeployClient({ apiKey: 'mock_key' });

    const aiConfig = client.getAIConfig('unknown-ai-flag', { id: 'usr_1' });
    expect(aiConfig).toBeNull();

    const fallback = {
      model: 'gpt-4o',
      temperature: 0.7,
      systemPrompt: 'Default assistant',
    };
    const result = client.getAIConfig('unknown-ai-flag', { id: 'usr_1' }, fallback);
    expect(result).toEqual(fallback);
  });
});