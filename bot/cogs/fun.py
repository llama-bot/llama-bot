import inspect
from discord.ext.commands.context import Context
from llama import Llama
from . import _util as util

import discord
from discord.ext import commands

import nekos
import random


class Fun(commands.Cog):
    def __init__(self, bot):
        self.bot: Llama = bot

        self.quotes: list[str] = self.bot.settings["quotes"]
        self.quotes_length = len(self.quotes)

        # key: server snowflake, value: index array
        self.quote_indices: dict[int, list[int]] = dict()

        # key: server snowflake, value: current quote index of server
        self.quote_current_index: dict[int, int] = dict()

    # block DM commands
    async def cog_check(self, ctx: commands.Context):
        if exception_or_bool := await util.on_pm(ctx.message, self.bot):
            raise exception_or_bool
        return not exception_or_bool

    @commands.command(
        aliases=[
            "quote",
        ],
        help="Shows a random llama quote.",
    )
    async def llama(self, ctx: Context):
        server_snowflake: int = ctx.guild.id

        # if server index array is not initialized
        if server_snowflake not in self.quote_indices:
            self.quote_indices[server_snowflake] = list(range(self.quotes_length))
            random.shuffle(self.quote_indices[server_snowflake])

        # if server current index is not set
        if server_snowflake not in self.quote_current_index:
            self.quote_current_index[server_snowflake] = 0

        await ctx.send(
            embed=discord.Embed(
                title="Llama quote that'll make your day",
                description=self.quotes[
                    self.quote_indices[server_snowflake][
                        self.quote_current_index[server_snowflake]
                    ]
                ],
            )
        )

        self.quote_current_index[server_snowflake] += 1
        if self.quote_current_index[server_snowflake] > (self.quotes_length - 1):
            # reshuffle and reset index
            random.shuffle(self.quote_indices[server_snowflake])
            self.quote_current_index[server_snowflake] = 0

    @commands.command(
        aliases=[
            "pp",
        ],
        help="""Measure user's pp length and arrange them in ascending order.
Shortest length: 0 (`8D`).
Longest length: 30 (`8==============================D`).

This is 101% accurate.""",
        usage="""> {prefix}{command} *[user]
ex:
> {prefix}{command} user1 user2
""",
    )
    async def penis(self, ctx: Context, *users: discord.Member):
        # key: user snowflake, value: tuple of pp string and integer length
        user_length: dict[int, tuple[str, int]] = dict()

        state = random.getstate()

        for user_id in users:
            random.seed(user_id.id)
            random_size = random.randint(0, 30)
            user_length[user_id.id] = (f"8{'=' * random_size}D", random_size)

        if not users:
            random.seed(ctx.author.id)
            random_size = random.randint(0, 30)
            user_length[ctx.author.id] = (f"8{'=' * random_size}D", random_size)

        random.setstate(state)

        await ctx.send(
            embed=discord.Embed(
                title="pp",
                description="\n".join(
                    [
                        f"**<@{user_id}>: {dong[1]}**\n{dong[0]}\n"
                        for user_id, dong in sorted(
                            user_length.items(), key=lambda x: x[1][1]
                        )
                    ]
                ),
            )
        )

    @commands.command(
        help="Shows image matching search term",
        usage="""> {prefix}{command} <target>
Can chose from:
**NSFW**:
`feet`, `yuri`, `trap`, `futanari`, `hololewd`, `lewdkemo`, `solog`, `feetg`, `cum`, `erokemo`, `les`, `wallpaper`, `lewdk`, `tickle`, `lewd`, `eroyuri`, `eron`, `cum_jpg`, `bj`, 'nsfw_neko_gif', `solo`, `kemonomimi`, `nsfw_avatar`, `gasm`, `anal`, `hentai`, `avatar`, `erofeet`, `holo`, `keta`, `blowjob`, `pussy`, `tits`, `holoero`, `pussy_jpg`, `pwankg`, `classic`, `kuni`, `kiss`, `femdom`, `neko`, `spank`, `erok`, `boobs`, `random_hentai_gif`, `smallboobs`, `ero`
**non NSFW**:
`feed`, `gecg`, `poke`, `slap`, `lizard`, `waifu`, `pat`, `8ball`, `cuddle`, `fox_girl`, `hug`, `smug`, `goose`, `baka`, `woof`

ex:
> {prefix}{command} neko""",
    )
    async def img(self, ctx: Context, target: str):
        non_nsfw = [
            "feed",
            "gecg",
            "poke",
            "slap",
            "lizard",
            "waifu",
            "pat",
            "8ball",
            "cuddle",
            "fox_girl",
            "hug",
            "smug",
            "goose",
            "baka",
            "woof",
        ]
        nsfw = [
            "feet",
            "yuri",
            "trap",
            "futanari",
            "hololewd",
            "lewdkemo",
            "solog",
            "feetg",
            "cum",
            "erokemo",
            "les",
            "wallpaper",
            "lewdk",
            "tickle",
            "lewd",
            "eroyuri",
            "eron",
            "cum_jpg",
            "bj",
            "nsfw_neko_gif",
            "solo",
            "kemonomimi",
            "nsfw_avatar",
            "gasm",
            "anal",
            "hentai",
            "avatar",
            "erofeet",
            "holo",
            "keta",
            "blowjob",
            "pussy",
            "tits",
            "holoero",
            "pussy_jpg",
            "pwankg",
            "classic",
            "kuni",
            "kiss",
            "femdom",
            "neko",
            "spank",
            "erok",
            "boobs",
            "random_hentai_gif",
            "smallboobs",
            "ero",
        ]
        in_nsfw = target in nsfw
        in_non_nsfw = target in non_nsfw
        if not (in_nsfw or in_non_nsfw):
            await ctx.send(
                embed=discord.Embed(
                    title="Oops",
                    description="Image category you're looking for doesn't exist. Here's all we got:",
                )
                .add_field(name="NSFW", value=f"`{'`, `'.join(nsfw)}`", inline=False)
                .add_field(
                    name="non NSFW", value=f"`{'`, `'.join(non_nsfw)}`", inline=False
                )
            )
            return

        if in_nsfw and not ctx.message.channel.is_nsfw():
            raise commands.errors.NSFWChannelRequired(ctx.channel)

        image_url = nekos.img(target.lower())
        await ctx.send(
            embed=discord.Embed(
                title="Image",
                description=f"requested by: {ctx.message.author.mention}\n**[Link if you don't see the image]({image_url})**",
            )
            .set_image(url=image_url)
            .set_footer(text=f"powered by nekos.life")
        )

    @commands.command(help="Shows useless facts.", usage="""> {prefix}{command}""")
    async def fact(self, ctx):
        await ctx.send(
            embed=discord.Embed(title="Fact of the day", description=nekos.fact())
        )

    @commands.command(
        aliases=[
            "clapify",
        ],
        help="does the annoying Karen clap. Does not work with external emojis.",
        usage="""> {prefix}{command} Put text to clapify here""",
    )
    async def clap(self, ctx: Context, arg1, *args):
        # using arg1 to make sure that at least one argument is passed

        args = list(args)
        args.insert(0, arg1)
        await ctx.send(" :clap: ".join(args))


def setup(bot):
    bot.add_cog(Fun(bot))
