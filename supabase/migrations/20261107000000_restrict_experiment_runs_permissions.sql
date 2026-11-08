-- The application shares an educational history and only reads or creates runs.
-- Use a new migration so databases that applied the original schema also receive
-- this restriction when the pending migrations are applied.

DROP POLICY IF EXISTS "Anyone can update experiment runs" ON public.experiment_runs;
DROP POLICY IF EXISTS "Anyone can delete experiment runs" ON public.experiment_runs;

REVOKE ALL PRIVILEGES ON TABLE public.experiment_runs FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.experiment_runs TO anon, authenticated;
