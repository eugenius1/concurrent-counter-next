-- Idempotent: the app applies this file on first database use.

CREATE TABLE IF NOT EXISTS counters(
  id text PRIMARY KEY, -- ULID
  value integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Publish every insert and update so the app can fan changes out to browsers.
-- `created` tells a new counter from a changed one, for the homepage total.
CREATE OR REPLACE FUNCTION notify_counter_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  PERFORM
    pg_notify('counter_changes', json_build_object('id', NEW.id, 'value', NEW.value, 'created', TG_OP = 'INSERT')::text);
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
