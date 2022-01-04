-- Create Trigger Function
CREATE OR REPLACE FUNCTION trigger_guild_create()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO public."LobbysModule" ("guildId", "categoryId", "generatorCategoryId", "enabled")
  values(NEW.id, '', '', false) ON CONFLICT ("guildId") DO NOTHING;
  INSERT INTO public."TicketsModule" ("guildId", "categoryId", "roleId", "enabled")
  values(NEW.id, '', '', false) ON CONFLICT ("guildId") DO NOTHING;
  INSERT INTO public."MomentsModule" ("guildId", "channelId", "roleId", "enabled")
  values(NEW.id, '', '', false) ON CONFLICT ("guildId") DO NOTHING;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger on Insert or Update
CREATE TRIGGER create_guild_modules_trigger
  AFTER INSERT OR UPDATE ON public."GuildProfile"
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_guild_create();