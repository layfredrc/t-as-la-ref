-- Hashtags per ref (each row = one hashtag attached to one ref)
CREATE TABLE ref_hashtags (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id UUID REFERENCES refs(id) ON DELETE CASCADE,
  label  TEXT NOT NULL
);

-- Global index of unique hashtags with usage counts
CREATE TABLE hashtags_index (
  label TEXT PRIMARY KEY,
  count INT DEFAULT 1
);

-- Increment count on insert
CREATE OR REPLACE FUNCTION increment_hashtag_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hashtags_index (label, count)
  VALUES (NEW.label, 1)
  ON CONFLICT (label) DO UPDATE SET count = hashtags_index.count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hashtag_insert
AFTER INSERT ON ref_hashtags
FOR EACH ROW EXECUTE FUNCTION increment_hashtag_count();

-- Decrement count on delete (floor at 0)
CREATE OR REPLACE FUNCTION decrement_hashtag_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hashtags_index
  SET count = GREATEST(count - 1, 0)
  WHERE label = OLD.label;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hashtag_delete
AFTER DELETE ON ref_hashtags
FOR EACH ROW EXECUTE FUNCTION decrement_hashtag_count();
