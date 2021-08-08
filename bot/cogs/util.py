from llama import Llama
from . import _util as util

import discord
from discord.ext import commands


class Util(commands.Cog):
    def __init__(self, bot):
        self.bot: Llama = bot
        self.bot.essential_cogs.add("core")

    # block DM commands
    async def cog_check(self, ctx: commands.Context):
        if exception_or_bool := await util.on_pm(ctx.message, self.bot):
            raise exception_or_bool
        return not exception_or_bool

    @commands.command(
        help="Calculates of when a discord ID (aka snowflake) was created.",
        usage="""> {prefix}{command} <snowflake>
ex:
> {prefix}{command} 501277805540147220""",
    )
    async def snowflake(self, ctx, snowflake_to_parse):
        try:
            datetime_data = util.snowflake_to_datetime(snowflake_to_parse).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        except ValueError:
            await ctx.send(
                embed=discord.Embed(
                    description="Input must be a valid discord snowflake (i.e. a number)"
                )
            )
            return
        await ctx.send(
            embed=discord.Embed(
                description=f"snowflake `{snowflake_to_parse}` was created in: `{datetime_data} UTC`"
            )
        )


def setup(bot):
    bot.add_cog(Util(bot))
