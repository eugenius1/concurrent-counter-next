-- Idempotent: the app applies this file on first database use.

CREATE TABLE IF NOT EXISTS counters(
  id text PRIMARY KEY, -- ULID
  value bigint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Databases created while values were 32-bit. Guarded so that later starts
-- don't take the table lock for a change that is already made.
DO $$
BEGIN
  IF EXISTS (
    SELECT
    FROM
      information_schema.columns
    WHERE
      table_schema = current_schema()
      AND table_name = 'counters'
      AND column_name = 'value'
      AND data_type = 'integer') THEN
    ALTER TABLE counters
      ALTER COLUMN value TYPE bigint;
  END IF;
END
$$;

-- Publish every insert and update so the app can fan changes out to browsers.
-- `created` tells a new counter from a changed one, for the homepage total.
-- The value is sent as text because a JSON number loses digits past 2^53.
CREATE OR REPLACE FUNCTION notify_counter_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  PERFORM
    pg_notify('counter_changes', json_build_object('id', NEW.id, 'value', NEW.value::text, 'created', TG_OP = 'INSERT')::text);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER counters_notify_change
  AFTER INSERT OR UPDATE ON counters
  FOR EACH ROW
  EXECUTE FUNCTION notify_counter_change();

-- The one counter every visitor sees on the homepage (DEMO_COUNTER_ID)
INSERT INTO counters(id)
  VALUES ('00000000000000000000000000')
ON CONFLICT (id)
  DO NOTHING;
