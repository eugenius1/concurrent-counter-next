-- Idempotent: the app applies this file on first database use.

CREATE TABLE IF NOT EXISTS counters(
  id text PRIMARY KEY, -- ULID
  value integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Publish every insert and update so the app can fan changes out to browsers
CREATE OR REPLACE FUNCTION notify_counter_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  PERFORM
    pg_notify('counter_changes', json_build_object('id', NEW.id, 'value', NEW.value)::text);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER counters_notify_change
  AFTER INSERT OR UPDATE ON counters
  FOR EACH ROW
  EXECUTE FUNCTION notify_counter_change();
