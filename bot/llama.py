from google.cloud.firestore_v1.collection import CollectionReference
from llama_bot_db import LlamaBotDB
import cogs._util as util

import discord
from discord.ext import commands

from os import listdir, path
from time import time
from typing import Any, Optional
import traceback
import json


def resolve_path(relative_path: str) -> str:
    """
    Converts relative path to absolute path for when the bot was executed in arbitrary path
    """
    return path.abspath(path.join(path.dirname(__file__), relative_path))


class Llama(commands.Bot):
    # IDs of users who can run owners only commands
    owner_id = 501277805540147220
    owner_ids = {owner_id, 396333737148678165}

    # set of essential cogs
    essential_cogs: set[str] = set()

    def __init__(self, firebase_cred_path: str, prefix: str = "-"):
        super().__init__(
            help_command=None,  # to overwrite with custom help command
            command_prefix=prefix,
            case_insensitive=True,  # allow mix of lower cae and upper case for commands
        )

        # create firestore interface
        self.db: LlamaBotDB = LlamaBotDB(firebase_cred_path)
        self.settings = self.db.get_bot_settings()

    # ----- [ DISCORD.PY STUFF ] -----

    async def on_ready(self):
        """
        variables in this function should be checked if they exist before fetching them from firebase.
        This method can be called multiple times as warned in the discord.py documentaton:
        https://discordpy.readthedocs.io/en/latest/api.html#discord.on_ready
        """

        # load all cog files that do not begin with a underscore
        cogs_dir = resolve_path("./cogs")
        for cog_path in [
            f"cogs.{path.splitext(f)[0]}"
            for f in listdir(cogs_dir)
            if path.isfile(path.join(cogs_dir, f)) and not f[0] == "_"
        ]:
            print(f"loading cog: {cog_path}")
            try:
                self.load_extension(cog_path)
            except commands.ExtensionAlreadyLoaded:
                print(f"Extension {cog_path} was already loaded. Skipping.")

        # to show bot uptime
        if not hasattr(self, "start_time"):
            self.start_time = time()

        guild: discord.Guild
        for guild in self.guilds:
            # settings
            ref: CollectionReference = self.db.servers_ref.collection("%s" % guild.id)
            if not ref.limit(1).get():
                self.db.create_server("%s" % guild.id)

        print(f"{self.user} is up and ready!")

    async def on_command_error(
        self,
        ctx: commands.Context,
        error: commands.CommandError,
    ):
        """
        Gets executed when the bot encounters an error.
        """

        # ignore error if it's simply a missing command
        if isinstance(error, commands.errors.CommandNotFound):
            return

        err_title: str = f"Error ({type(error).__name__})"
        err_description: str = ""

        if isinstance(error, util.NotAdminChannel):
            err_title = ":lock: Not in admin channel"
            err_description = f"This command can only be called in admins channels."

        if isinstance(error, commands.errors.NSFWChannelRequired):
            err_title = ":lock: Not in nsfw channel"
            err_description = "This command can only be called in NSFW channels."

        if isinstance(error, commands.errors.NotOwner):
            err_title = f":lock: Not a bot owner"
            err_description = "Only the bot owner(s) can call that command."

        if isinstance(error, commands.errors.BotMissingPermissions):
            missing_perms = "".join([f"- {i}\n" for i in error.missing_perms])
            err_title = ":exclamation: Missing Permission(s)"
            err_description = f"missing the following permissions:\n{missing_perms}"

        if isinstance(error, commands.errors.MissingRequiredArgument):
            err_title = f":exclamation: Missing required argument(s)"
            err_description = f"Consider using the `{self.command_prefix}help {ctx.command}` command to learn how to use it."

        if isinstance(
            error,
            (
                commands.errors.BadArgument,
                commands.ArgumentParsingError,
            ),
        ):
            err_title = f":exclamation: Invalid argument(s)"
            err_description = f"`Consider using the `{self.command_prefix}help {ctx.command}` command to learn how to use it."

        if isinstance(error, commands.errors.MemberNotFound):
            err_title = f":exclamation: Member not found"
            err_description = f"Member {error.argument} was not found in this server."

        # When command failed to complete
        if isinstance(error, commands.errors.CommandInvokeError):
            err_title = ":exclamation: Command Failed to complete"
            err_description = "Encountered an unknown error."

        await ctx.send(
            embed=discord.Embed(
                title=err_title,
                description=err_description,
            )
            .add_field(name="Channel", value=ctx.message.channel.mention)
            .add_field(name="Author", value=ctx.author.mention)
            .add_field(name="Message", value=f"[Message URL]({ctx.message.jump_url})")
            .add_field(name="Content", value=ctx.message.content[:1024], inline=False)
        )

        # Log details in terminal
        print("")
        print("=" * 30)
        print(type(error))
        print("Cog:", ctx.cog)
        print("Author:", ctx.author, ctx.author.id)
        print("Content:", ctx.message.content)
        print("Channel:", ctx.message.channel, ctx.message.channel.id)
        print("URL:", ctx.message.jump_url)
        print("")
        traceback.print_exception(type(error), error, error.__traceback__)
        print("=" * 30)
        print("")


def main():
    try:
        with open(resolve_path("./config.json"), "rt") as f:
            config = json.loads(f.read())
    except FileNotFoundError:
        # ignore if config.json does not exist
        pass

    with open(resolve_path("./secrets/secret.json"), "rt") as f:
        secret = json.loads(f.read())

    # set default prefix if it exists
    prefix = (
        (config["prefix"] if "prefix" in config else None)
        if "config" in locals()
        else None
    )
    firebase_path = resolve_path("./secrets/firebase-adminsdk.json")

    llama_bot = Llama(firebase_path, prefix) if prefix else Llama(firebase_path)
    llama_bot.run(secret["token"])


if __name__ == "__main__":
    main()
