from llama import Llama
from . import _util as util

import discord
from discord.ext import commands

import re
import datetime
import operator
import traceback
from threading import Timer


class Pinning(commands.Cog):
    # Roles that are allowed to pin messages
    # key: server id | value: set of role ids
    allowed_roles: dict[int, set[int]] = dict()

    # key: server id | value: set of channel ids
    enabled_channels: dict[int, set[int]] = dict()

    # key: server id | value: set of (source channel id, destination channel id) tuple
    archive_maps: dict[int, set[tuple[int, int]]] = dict()

    # Emojis that are used to pin a message
    # key: server id | value: set of discord partial emojis
    pin_emojis: dict[int, set[discord.PartialEmoji]] = dict()

    # Messages that are in this record can not be pinned.
    # This is to prevent pin spamming or accidental double pin.
    # key: server id | key: set of (channel_id, message_id) tuple
    recently_pinned_messages: dict[int, set[tuple[int, int]]] = dict()

    # Timer for recently_pinned_messages measured in seconds
    # key: server id | value: float
    pin_cooldown: dict[int, float] = dict()

    def __init__(self, bot):
        self.bot: Llama = bot

        self.help_msg = ""
        self.main_help_fields = [
            [
                "Pinning",
                """Add one of these reactions to pin a message: %s
You'll need at least one of the following roles to use this feature: %s""",
            ],
        ]
        # {' | '.join(map(str, self.pin_emojis))}
        # {' | '.join([role.mention for role in self.bot.PIN_PERMISSIONS])}

    # block DM commands
    async def cog_check(self, ctx: commands.Context):
        if exception_or_bool := await util.on_pm(ctx.message, self.bot):
            raise exception_or_bool
        return not exception_or_bool

    def get_archive_map(self) -> set[(int, int)]:
        res: set[(int, int)] = set()
        self.bot.settings["pinbot"] = self.bot.db.read_document("vars", "pinbot")
        for map_str in self.bot.settings["pinbot"]["maps"]:
            try:
                map_ids = map_str.split(",")
                assert len(map_ids) == 2
                source_channel_id, destination_channel_id = map(int, map_ids)
                source_channel = self.bot.get_channel(source_channel_id)
                destination_channel = self.bot.get_channel(destination_channel_id)
                assert source_channel
                assert destination_channel
                res.add((source_channel, destination_channel))
            except (AssertionError, ValueError):
                traceback.print_exc()

        return res

    def channel_maps_write(self):
        self.bot.db.write_data(
            "vars",
            "pinbot",
            "maps",
            ["%s,%s" % (i[0].id, i[1].id) for i in self.channel_maps],
        )

    def pinnable_channels_read(self) -> set[int]:
        res: set[discord.TextChannel] = set()
        self.bot.settings["pinbot"] = self.bot.db.read_document("vars", "pinbot")
        for channel_id in self.bot.settings["pinbot"]["allowed_channels"]:
            try:
                channel: discord.TextChannel = self.bot.get_channel(int(channel_id))
                assert channel, f"channel {channel_id} does not exist in the LP server"
                res.add(channel)
            except (AssertionError, ValueError):
                traceback.print_exc()

        return res

    def pinnable_channels_write(self):
        self.bot.db.write_data(
            "vars",
            "pinbot",
            "allowed_channels",
            ["%s" % channel.id for channel in self.pinnable_channels],
        )

    async def message2embed(self, ctx: commands.Context, message: discord.Message):
        # todo: check if suppress_embeds flag is set

        has_video = False
        new_embed = discord.Embed()
        new_embed.description = message.content[:1900] + (
            "..." if len(message.content) > 1900 else ""
        )
        new_embed.add_field(
            name="pin info",
            value=f"channel: {message.channel.mention}\n[Jump to message]({message.jump_url})",
            inline=False,
        )

        if message.embeds:
            original_embed = message.embeds[0]
            if not original_embed.video:
                new_embed.title = original_embed.title
                new_embed.colour = original_embed.colour
                new_embed.url = original_embed.url

                if original_embed.description:
                    new_embed.add_field(
                        name="content", value=original_embed.description, inline=False
                    )
                for field in original_embed.fields:
                    new_embed.add_field(
                        name=field.name, value=field.value, inline=field.inline
                    )
                if original_embed.image:
                    new_embed.set_image(url=original_embed.image.url)
                if original_embed.thumbnail:
                    new_embed.set_thumbnail(url=original_embed.thumbnail.url)
                if original_embed.footer:
                    new_embed.set_footer(
                        text=original_embed.footer.text,
                        icon_url=original_embed.footer.icon_url,
                    )
            else:
                has_video = True

        files = [
            await attachment.to_file(spoiler=attachment.is_spoiler())
            for attachment in message.attachments
        ]
        if has_video:
            await ctx.send("\n".join(util.url_from_str(message.content)), files=files)
        else:
            await ctx.send(embed=new_embed, files=files)

    # reaction pinning
    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if payload.emoji not in self.pin_emojis:
            return

        channel: discord.TextChannel = self.bot.get_channel(payload.channel_id)
        message: discord.Message = await channel.fetch_message(payload.message_id)

        if channel not in self.pinnable_channels:
            return

        channel_message_tuple: tuple(int, int) = (channel.id, message.id)
        if channel_message_tuple in self.recently_pinned_messages:
            await channel.send(
                embed=discord.Embed(
                    description=f"waiting for {self.pin_cooldown} second message pin cooldown!"
                )
            )
            return

        original_message_content = f"pinning [a message]({message.jump_url}) as requested by: {payload.member.mention}"
        original_message = await channel.send(
            embed=discord.Embed(description=original_message_content)
        )

        # if the user has any role with pinning permission
        if not util.lists_has_intersection(
            self.bot.PIN_PERMISSIONS, payload.member.roles
        ):
            await original_message.edit(
                embed=discord.Embed(
                    description=original_message_content
                    + f"\n:exclamation: FAILED\nTo pin a message, you need at lest one of the following roles:\n-"
                    + ("\n-".join([role.mention for role in self.bot.PIN_PERMISSIONS]))
                )
            )
            return
        if message.pinned:
            await original_message.edit(
                embed=discord.Embed(
                    description=original_message_content + "\n:pushpin: Already pinned!"
                )
            )
            return

        try:
            await message.pin()
        except Exception as err:
            err_type = type(err)
            why_fail = "Unknown reason"
            if err_type == discord.Forbidden:
                why_fail = "Bot does not have permission"
            elif err_type == discord.NotFound:
                why_fail = "message not found"
            elif err_type == discord.HTTPException:
                # channel as more then 50 pins, message is a system message, etc.
                pass
            await original_message.edit(
                embed=discord.Embed(
                    description=original_message_content
                    + f"\n:exclamation: FAILED ({why_fail}) :exclamation:"
                )
            )
            return

        self.recently_pinned_messages.add(channel_message_tuple)
        Timer(
            self.pin_cooldown,
            lambda: self.recently_pinned_messages.remove(channel_message_tuple),
        ).start()

        await original_message.edit(
            embed=discord.Embed(description=original_message_content + "\nsuccess!")
        )

    # pin archiving
    @commands.Cog.listener()
    async def on_guild_channel_pins_update(
        self, channel: discord.abc.GuildChannel, last_pin: datetime.datetime
    ):
        # print(channel, last_pin)
        pass

    @commands.command(
        aliases=[
            "rp",
        ],
        help="Enables or Disables reaction pinning for given channels",
        usage="""> {prefix}{command} <enable|disable> *<channel ID|channel mention>
ex:
- Enabling reaction pinning in <#761546616036524063> and <#764367748125949952>
> {prefix}{command} enable <#761546616036524063> <#764367748125949952>
or
> {prefix}{command} e <#761546616036524063> <#764367748125949952>

- Disabling reaction pinning for <#761546616036524063> and <#764367748125949952>
> {prefix}{command} disable <#761546616036524063> <#764367748125949952>
or
> {prefix}{command} d <#761546616036524063> <#764367748125949952>""",
    )
    @util.must_be_admin()
    async def reactionpin(
        self, ctx: commands.Context, operation: str, *raw_channels: str
    ):
        channels: set[int] = set()

        if not raw_channels:
            await ctx.send(
                embed=discord.Embed(
                    title="No channels were given",
                    description="No channels were given as input. Aborting.",
                )
            )
            return

        for channel_str in raw_channels:
            try:
                channel: discord.channel.TextChannel = self.bot.get_channel(
                    int(re.search(r"\d+", channel_str).group())
                )
                assert channel
                channels.add(channel)
            except (ValueError, IndexError, AssertionError):
                await ctx.send(
                    embed=discord.Embed(
                        title="Oops!",
                        description=f"{channel_str} (`{channel_str}`) is not a valid channel.",
                    )
                )
                return

        def channels_to_mentions():
            return "\n-".join([channel.mention for channel in channels])

        if operation in ["enable", "e"]:
            self.pinnable_channels.update(channels)
            self.pinnable_channels_write()
            await ctx.send(
                embed=discord.Embed(
                    title="Enabled Reaction pinning!",
                    description=f"People can now react in:\n-{channels_to_mentions()}\n with {' '.join(map(str, self.pin_emojis))} to pin a message!",
                )
            )
        elif operation in ["disable", "d"]:
            self.pinnable_channels.difference_update(channels)
            self.pinnable_channels_write()
            await ctx.send(
                embed=discord.Embed(
                    title="Disabled Reaction pinning!",
                    description=f"Adding reactions to messages in \n-{channels_to_mentions()}\n will **NOT** pin them now.",
                )
            )
        else:
            raise discord.ext.commands.ArgumentParsingError

    # not in reactionpin because it requires admin permission to run
    @commands.command(
        help="Shows channels with reaction pinning enabled.",
    )
    async def pinnable(self, ctx: commands.Context):
        # todo: fix channels with no category not ordered properly

        # sort in order they're arranged in discord (sort by "position" attribute)
        sorted_channels: list[discord.abc.GuildChannel] = sorted(
            self.pinnable_channels, key=operator.attrgetter("position")
        )

        description: str = ""
        previous_channel_category_id: int = int()
        previous_channel_had_category: bool = bool()

        for channel in sorted_channels:
            if channel.category_id:
                previous_channel_had_category = True
                if previous_channel_category_id != channel.category_id:
                    previous_channel_category_id = channel.category_id
                    description += f"\n**{channel.category.name.upper()}**\n"
                description += f"    - {channel.mention}\n"
            else:
                if previous_channel_had_category:
                    description += f"\n"
                previous_channel_had_category = False
                description += f"- {channel.mention}\n"

        if not sorted_channels:
            description = "No channels have reaction pinning enabled yet."

        await ctx.send(
            embed=discord.Embed(
                title="Channels with reaction pinning enabled", description=description
            )
        )

    @commands.command(
        help="Creates or removes pin mapping from source channel to destination channel.",
        usage="""> {prefix}{command} <operation: create | c | destroy | d> <source_channel> <destination_channel>
ex:
- Using channel mentions
> {prefix}{command} create <#761546616036524063> <#764029864033779732>
> {prefix}{command} destroy <#761546616036524063> <#764029864033779732>

- Using channel ids
> {prefix}{command} create 761546616036524063 764029864033779732
> {prefix}{command} destroy 761546616036524063 764029864033779732""",
    )
    @util.must_be_admin()
    async def map(
        self,
        ctx: commands.Context,
        operation: str,
        source_channel_raw: str,
        destination_channel_raw: str,
    ):
        op1 = ["create", "c"]
        op2 = ["destroy", "d"]

        operation_mode = 0  # 0: None, 1: Create, 2: Destroy

        if operation in op1:
            operation_mode = 1
        if operation in op2:
            operation_mode = 2
        if not operation_mode:
            raise discord.ext.commands.errors.BadArgument

        try:
            source_channel = self.bot.get_channel(
                int(re.search(r"\d+", source_channel_raw).group())
            )
            destination_channel = self.bot.get_channel(
                int(re.search(r"\d+", destination_channel_raw).group())
            )
        except (ValueError, IndexError):
            raise discord.ext.commands.errors.BadArgument

        if not (source_channel or destination_channel):
            await ctx.send(
                embed=discord.Embed(
                    title="Smh",
                    description="That source and destination channel doesn't exist",
                )
            )
            return
        if not source_channel:
            await ctx.send(
                embed=discord.Embed(
                    title="Oopsies!", description="That source channel doesn't exist!"
                )
            )
            return
        if not destination_channel:
            await ctx.send(
                embed=discord.Embed(
                    title="Nope!", description="That destination channel doesn't exist!"
                )
            )
            return

        new = (source_channel, destination_channel)
        new_map = f"{source_channel.mention} ⟶ {destination_channel.mention}"
        if operation_mode == 1:
            if new in self.channel_maps:
                await ctx.send(
                    embed=discord.Embed(
                        title="Hmmm", description=f"map\n{new_map}\nalready exists"
                    )
                )
                return
            self.channel_maps.add(new)
            await ctx.send(
                embed=discord.Embed(title="Pin map registered!", description=new_map)
            )
        elif operation_mode == 2:
            if new not in self.channel_maps:
                await ctx.send(
                    embed=discord.Embed(
                        title="Wait", description=f"map\n{new_map}\nalready removed"
                    )
                )
                return
            self.channel_maps.discard(new)
            await ctx.send(
                embed=discord.Embed(title="Pin map removed!", description=new_map)
            )
        self.channel_maps_write()

    @commands.command(help="Shows list of pin source and destination channels.")
    async def maps(self, ctx: commands.Context):
        # todo: order channels
        description = ""

        if self.channel_maps:
            for source_channel, destination_channel in self.channel_maps:
                description += (
                    f"{source_channel.mention} ⟶ {destination_channel.mention}\n"
                )
        else:
            description = "No maps yet."

        await ctx.send(embed=discord.Embed(title="Pin maps", description=description))


def setup(bot: commands.Bot):
    bot.add_cog(Pinning(bot))
