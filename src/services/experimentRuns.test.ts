import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collisionFixture } from '../test/fixtures';
import { getRecentRuns, saveExperimentRun } from './experimentRuns';

const mocks = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const connectedClient = { from: vi.fn() };
  return { query, connectedClient, client: connectedClient as typeof connectedClient | null };
});

vi.mock('../lib/supabase', () => ({
  get supabase() {
    return mocks.client;
  },
}));

const row = {
  id: 'database-run',
  output_bits: 8,
  cycle_length: 2,
  created_at: '2026-11-07T15:00:00.000Z',
};
const record = { id: row.id, bits: 8, cycleLength: 2, createdAt: row.created_at };

beforeEach(() => {
  mocks.client = mocks.connectedClient;
  mocks.connectedClient.from.mockReturnValue(mocks.query);
  mocks.query.select.mockReturnValue(mocks.query);
  mocks.query.order.mockReturnValue(mocks.query);
  mocks.query.insert.mockReturnValue(mocks.query);
  mocks.query.limit.mockResolvedValue({ data: [] });
  mocks.query.maybeSingle.mockResolvedValue({ data: null });
});

describe('serviço de experimentos', () => {
  it('busca os cinco registros mais recentes e converte os campos do banco', async () => {
    mocks.query.limit.mockResolvedValueOnce({ data: [row] });

    await expect(getRecentRuns()).resolves.toEqual([record]);
    expect(mocks.connectedClient.from).toHaveBeenCalledWith('experiment_runs');
    expect(mocks.query.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mocks.query.limit).toHaveBeenCalledWith(5);
  });

  it('retorna um histórico vazio quando a consulta não contém dados', async () => {
    mocks.query.limit.mockResolvedValueOnce({ data: null, error: { message: 'Indisponível' } });
    await expect(getRecentRuns()).resolves.toEqual([]);
  });

  it('grava os metadados da colisão e converte o registro retornado', async () => {
    mocks.query.maybeSingle.mockResolvedValueOnce({ data: row });

    await expect(saveExperimentRun(8, collisionFixture)).resolves.toEqual(record);
    expect(mocks.query.insert).toHaveBeenCalledExactlyOnceWith({
      output_bits: 8,
      hash_algorithm: 'keccak-f200-floyd-v1',
      iterations: collisionFixture.collisionIndex,
      cycle_start: collisionFixture.cycleStart,
      cycle_length: collisionFixture.cycleLength,
      collision_index: collisionFixture.collisionIndex,
      seed: collisionFixture.seed,
      requested_seed: collisionFixture.requestedSeed,
      collision_input_a: collisionFixture.collisionInputs[0],
      collision_input_b: collisionFixture.collisionInputs[1],
      collision_value: collisionFixture.collisionValue,
      hash_evaluations: collisionFixture.evaluations,
      search_attempts: collisionFixture.attempts,
    });
  });

  it('retorna null quando a gravação não contém um registro', async () => {
    mocks.query.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Indisponível' },
    });
    await expect(saveExperimentRun(4, collisionFixture)).rejects.toThrow('Indisponível');
  });

  it('oferece o modo local sem tentar acessar um cliente não configurado', async () => {
    mocks.client = null;

    await expect(getRecentRuns()).resolves.toEqual([]);
    await expect(saveExperimentRun(8, collisionFixture)).resolves.toBeNull();
    expect(mocks.connectedClient.from).not.toHaveBeenCalled();
  });
});
