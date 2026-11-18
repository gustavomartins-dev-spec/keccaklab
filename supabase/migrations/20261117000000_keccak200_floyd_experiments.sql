-- Preserve historical toy-hash runs and identify new Keccak/Floyd runs explicitly.
ALTER TABLE public.experiment_runs
  DROP CONSTRAINT experiment_runs_output_bits_check,
  ADD CONSTRAINT experiment_runs_output_bits_check
    CHECK (output_bits IN (4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40)),
  ADD COLUMN hash_algorithm text NOT NULL DEFAULT 'legacy-toy',
  ADD COLUMN requested_seed bigint CHECK (requested_seed >= 0),
  ADD COLUMN seed bigint CHECK (seed >= 0),
  ADD COLUMN collision_input_a bigint CHECK (collision_input_a >= 0),
  ADD COLUMN collision_input_b bigint CHECK (collision_input_b >= 0),
  ADD COLUMN collision_value bigint CHECK (collision_value >= 0),
  ADD COLUMN hash_evaluations bigint CHECK (hash_evaluations > 0),
  ADD COLUMN search_attempts integer CHECK (search_attempts > 0),
  ADD CONSTRAINT experiment_runs_hash_algorithm_check
    CHECK (hash_algorithm IN ('legacy-toy', 'keccak-f200-floyd-v1')),
  ADD CONSTRAINT experiment_runs_collision_proof_check CHECK (
    hash_algorithm <> 'keccak-f200-floyd-v1' OR (
      requested_seed IS NOT NULL AND requested_seed < power(2::numeric, output_bits)
      AND seed IS NOT NULL AND seed < power(2::numeric, output_bits)
      AND collision_input_a IS NOT NULL AND collision_input_a < power(2::numeric, output_bits)
      AND collision_input_b IS NOT NULL AND collision_input_b < power(2::numeric, output_bits)
      AND collision_input_a <> collision_input_b
      AND collision_value IS NOT NULL AND collision_value < power(2::numeric, output_bits)
      AND hash_evaluations IS NOT NULL AND search_attempts IS NOT NULL
      AND cycle_start > 0 AND collision_index = cycle_start + cycle_length
      AND iterations = collision_index
    )
  );

COMMENT ON COLUMN public.experiment_runs.iterations IS
  'New Floyd runs: trajectory steps mu + lambda, separate from total hash evaluations.';
COMMENT ON COLUMN public.experiment_runs.hash_algorithm IS
  'legacy-toy identifies records created before Keccak-f[200]/Floyd was implemented.';
