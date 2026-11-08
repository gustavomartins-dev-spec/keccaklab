/*
# Create experiment runs for the SHA-3 learning lab

1. New Tables
- `experiment_runs` stores recent Pollard's Rho executions so the dashboard can show reproducible experiment history.
- `id` is the generated identifier for a run.
- `output_bits` stores the reduced hash size selected by the learner.
- `iterations` stores the number of generated states.
- `cycle_start` stores the detected cycle entry index.
- `cycle_length` stores the detected cycle length.
- `collision_index` stores the first repeated state index.
- `created_at` stores when the run was saved.

2. Security
- Row-level security is enabled.
- This is a single-tenant educational workspace without sign-in, so anonymous and authenticated clients can create and read shared experiment history.
- Four explicit CRUD policies are created for predictable access control.

3. Important Notes
- The table contains only non-sensitive experiment metadata.
- The application can continue working locally if a database request is unavailable; the database is used for durable recent history.
*/

CREATE TABLE IF NOT EXISTS public.experiment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  output_bits integer NOT NULL CHECK (output_bits IN (4, 6, 8)),
  iterations integer NOT NULL CHECK (iterations >= 0),
  cycle_start integer NOT NULL CHECK (cycle_start >= 0),
  cycle_length integer NOT NULL CHECK (cycle_length > 0),
  collision_index integer NOT NULL CHECK (collision_index >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiment_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read experiment runs" ON public.experiment_runs;
CREATE POLICY "Anyone can read experiment runs"
  ON public.experiment_runs FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can create experiment runs" ON public.experiment_runs;
CREATE POLICY "Anyone can create experiment runs"
  ON public.experiment_runs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update experiment runs" ON public.experiment_runs;
CREATE POLICY "Anyone can update experiment runs"
  ON public.experiment_runs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete experiment runs" ON public.experiment_runs;
CREATE POLICY "Anyone can delete experiment runs"
  ON public.experiment_runs FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS experiment_runs_created_at_idx
  ON public.experiment_runs (created_at DESC);
