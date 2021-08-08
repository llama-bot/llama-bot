# I'm aware that I can use @commands.bot_has_permissions. It's a choice.
from llama import Llama

import discord
from discord.ext import commands

from datetime import datetime
from typing import Literal, Union
import re


class NotAdminChannel(discord.ext.commands.errors.CheckFailure):
    pass


def must_be_admin():
    """
    Discord bot command decorator.
    Put it under @discord.ext.commands.command()
    """

    async def predicate(ctx: discord.ext.commands.Context):
        if ctx.message.author.guild_permissions.administrator:
            return True
        await ctx.send(
            embed=discord.Embed(
                description=f"You need to be a server administrator to issue the command. Aborting."
            )
        )
        return False

    return commands.check(predicate)


def lists_has_intersection(list1: list, list2: list) -> bool:
    """
    Checks if any of the roles in roles1 is in roles2
    """
    return any(element in list1 for element in list2)


def url_from_str(string: str) -> list:
    """
    Extract urls from string
    https://daringfireball.net/2010/07/improved_regex_for_matching_urls
    """
    url = re.findall(
        r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))",
        string,
    )
    return [x[0] for x in url]


def snowflake_to_datetime(snowflake: int) -> datetime:
    return datetime.utcfromtimestamp(((int(snowflake) >> 22) + 1420070400000) / 1000)


def convert_to_partial_emoji(raw: Union[str, int], bot: Llama) -> discord.PartialEmoji:
    # test if raw is an integer
    try:
        emoji_id = int(raw)

        # check if emoji exists
        emoji: discord.Emoji = bot.get_emoji(emoji_id)
        if not emoji:
            raise Exception(f"Cannot convert {raw} to discord Emoji.")

        return discord.PartialEmoji(
            name=emoji.name, animated=emoji.animated, id=emoji_id
        )
    except ValueError:  # if emoji_raw is not a number
        # todo: test if emoji is valid.
        # todo: The checks that can be found online only works for custom emojis and not for emojis like 📌 or 📍.
        return discord.PartialEmoji(name=raw.strip())


async def on_pm(
    message: discord.Message, bot: Llama
) -> Union[Literal[False], commands.NoPrivateMessage]:
    if message.guild or message.author == bot.user:
        return False

    err_msg = "DM commands are not supported."
    await message.channel.send(
        embed=discord.Embed(
            title=":exclamation: " + err_msg,
            description="react with a :broom: emoji (`:broom:`) to delete existing messages.\nThis message will delete itself in 5 seconds.",
        ),
        delete_after=5.0,
    )
    return commands.NoPrivateMessage(err_msg)
