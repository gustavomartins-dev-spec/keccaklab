import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, client } = vi.hoisted(() => ({
  createClient: vi.fn(),
  client: { from: vi.fn() },
}));

vi.mock('@supabase/supabase-js', () => ({ createClient }));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', '');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
  createClient.mockReturnValue(client);
});

describe('configuração do Supabase', () => {
  it.each([
    { url: '', key: '' },
    { url: 'https://example.supabase.co', key: '' },
    { url: '', key: 'test-key' },
  ])('mantém o modo local quando falta uma credencial: $url / $key', async ({ url, key }) => {
    vi.stubEnv('VITE_SUPABASE_URL', url);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', key);

    const { supabase } = await import('./supabase');
    expect(supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('inicializa o cliente com as credenciais configuradas', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    const { supabase } = await import('./supabase');
    expect(supabase).toBe(client);
    expect(createClient).toHaveBeenCalledExactlyOnceWith('https://example.supabase.co', 'test-key');
  });
});
