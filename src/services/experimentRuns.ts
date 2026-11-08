import { RECENT_RUNS_LIMIT } from '../constants/experiments';
import type { RhoResult } from '../types/experiments';
import { supabase } from '../lib/supabase';
import type { OutputBits, RunRecord } from '../types/experiments';

interface ExperimentRunRow {
  id: string;
  output_bits: OutputBits;
  cycle_length: number;
  created_at: string;
}

const toRunRecord = (record: ExperimentRunRow): RunRecord => ({
  id: record.id,
  bits: record.output_bits,
  cycleLength: record.cycle_length,
  createdAt: record.created_at,
});

export async function getRecentRuns(): Promise<RunRecord[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from('experiment_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(RECENT_RUNS_LIMIT);

  return data?.map(toRunRecord) ?? [];
}

export async function saveExperimentRun(
  bits: OutputBits,
  result: RhoResult,
): Promise<RunRecord | null> {
  if (!supabase) return null;

  const { data } = await supabase
    .from('experiment_runs')
    .insert({
      output_bits: bits,
      iterations: result.points.length,
      cycle_start: result.cycleStart,
      cycle_length: result.cycleLength,
      collision_index: result.collisionIndex,
    })
    .select()
    .maybeSingle();

  return data ? toRunRecord(data) : null;
}
