import { Message, MessageEmbed } from "discord.js"
import {
	Args,
	Command,
	CommandOptions,
	CommandStore,
} from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import stringSimilarity from "string-similarity"

enum QueryType {
	empty = "empty",
	command = "command",
	category = "category",
	unknown = "unknown",
}

type CategorizeQueryReturn =
	| { queryType: QueryType.empty }
	| { queryType: QueryType.command; command: Command }
	| { queryType: QueryType.category }
	| { queryType: QueryType.unknown }

@ApplyOptions<CommandOptions>({
	aliases: ["h"],
	description:
		"Shows list of helpful information about a command or a command category.",
})
export default class HelpCommand extends Command {
	usage = `> ${process.env.PREFIX}{command} <cog | command | None>
ex:
List cogs:
> ${process.env.PREFIX}{command}
List commands in the \`core\` cog:
> ${process.env.PREFIX}{command} core
Shows info about \`ping\` command:
> ${process.env.PREFIX}{command} ping`

	commands: CommandStore = this.container.client.stores.get("commands")

	// lower case names of categories
	lowerCaseCategoryNames: string[] = []

	async messageRun(message: Message, args: Args): Promise<void> {
		// todo: find ways to set it on command initialization
		// todo: also prevent command from having same name as command category
		if (this.lowerCaseCategoryNames.length <= 0) {
			this.lowerCaseCategoryNames = this.commands.categories.map((elem) =>
				elem.toLowerCase()
			)
		}

		const query: string = await args.pick("string").catch(() => "")
		const queryCategory = this.categorizeQuery(query)

		switch (queryCategory.queryType) {
			case QueryType.empty:
				this.sendDefaultHelpMessage(message)
				break
			case QueryType.command:
				this.sendCommandHelpMessage(message, queryCategory.command)
				break
			case QueryType.category:
				this.sendCategoryHelpMessage(message, query)
				break
			default:
				this.sendCommandNotFoundMessage(message, query)
				break
		}
	}

	categorizeQuery(input: string): CategorizeQueryReturn {
		const query = input.toLowerCase()

		if (!query) return { queryType: QueryType.empty }

		if (this.lowerCaseCategoryNames.includes(query))
			return { queryType: QueryType.category }

		const command = this.commands.find(
			(command: Command, key: string) =>
				key.toLowerCase() == query ||
				command.aliases.map((elem) => elem.toLowerCase()).includes(query)
		)
		if (command) return { queryType: QueryType.command, command }

		return { queryType: QueryType.unknown }
	}

	sendDefaultHelpMessage(message: Message): void {
		const helpEmbed = new MessageEmbed()
			.setTitle("Help")
			.setDescription(
				`Type \`${process.env.PREFIX}help <command | category>\` to get more information about a command or a command category.`
			)

		this.lowerCaseCategoryNames.forEach((elem) =>
			helpEmbed.addField(elem, "this command category is for something.", true)
		)

		message.channel.send({
			embeds: [helpEmbed],
		})
	}

	sendCommandHelpMessage(message: Message, command: Command): void {
		const aliases = command.aliases
			? `\`${command.aliases.join("`, `")}\``
			: "None"

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(command.name)
					.setDescription(`Aliases: ${aliases}`)
					.addField("Description", command.description || "None")
					.addField("Usage", command.usage || "None"),
			],
		})
	}

	sendCategoryHelpMessage(message: Message, query: string): void {
		console.log(query)

		for (const store of this.container.client.stores.values()) {
			console.log(store.name)
		}

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Category")
					.setDescription("Category description")
					.addField("commands", "-command\n".repeat(5)),
			],
		})
	}

	sendCommandNotFoundMessage(message: Message, query: string): void {
		// get all command names and aliases
		const allCommands = [...this.commands.keys()].concat(
			this.commands.aliases
				.map((elem) => elem.aliases)
				.reduce((prev, curr) => prev.concat(curr)) as string[]
		)

		const mostLikelyGuess =
			allCommands[
				stringSimilarity.findBestMatch(query, allCommands).bestMatchIndex
			]

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Command not found")
					.setDescription(
						`Command \`${query}\` was not found. Did you mean \`${mostLikelyGuess}\`?`
					),
			],
		})
	}
}

/*
    async def help(self, ctx, cog_str=None):
        if not cog_str:  # when no argument is passed
            help_embed = discord.Embed(
                title="Help",
                description=f"Use `{self.bot.command_prefix}help <cog>` command to get more information on a cog. (case insensitive)",
            )

            for cog_name in self.bot.cogs:
                # Show command to get help for a cog
                help_embed.add_field(
                    name=cog_name,
                    value=f"`{self.bot.command_prefix}help {cog_name.lower()}`",
                )

            for cog_name in self.bot.cogs:
                # fields that will be shown in main help embed
                try:
                    for field in self.bot.get_cog(cog_name).main_help_fields:
                        help_embed.add_field(
                            name=field[0], value=field[1], inline=False
                        )
                except AttributeError:
                    # cog doesn't have main_help_fields
                    pass

            await ctx.send(embed=help_embed)
        else:  # when searching for a specific cog
            cogs = list(self.bot.cogs.keys())
            lower_cogs = [cog.lower() for cog in cogs]
            lower_cog_str = cog_str.lower()  # lower case string of cog

            if lower_cog_str in lower_cogs:  # when a cog has been found
                cog = self.bot.get_cog(cogs[lower_cogs.index(lower_cog_str)])

                await ctx.send(
                    embed=discord.Embed(
                        title=f'"{lower_cog_str}" commands',
                        description=f"Use `{self.bot.command_prefix}help <command>` to get more information about a command. (case insensitive)\n\n"
                        # keep cog_help empty if cog.help_msg does not exist
                        + (cog.help_msg + ("\n\n" if cog.help_msg else ""))
                        if hasattr(cog, "help_msg")
                        else ""
                        + f"**Commands:**\n `{'`, `'.join([command.name for command in cog.get_commands()])}`",
                    )
                )
            else:  # when a cog has not been found
                command: discord.ext.commands.Command = discord.utils.get(
                    self.bot.commands, name=cog_str
                )

                if not command:  # when command was not found
                    await ctx.send(
                        embed=discord.Embed(
                            description=f"Cannot find cog/command **{cog_str}**.\nUse the `{self.bot.command_prefix}help` command to list all enabled cogs."
                        )
                    )
                else:  # when a command has been found
                    await ctx.send(
                        embed=discord.Embed(
                            title=f"{self.bot.command_prefix}{command.name}",
                            description=(
                                f"**Aliases:** `{'`, `'.join(command.aliases)}`"
                                if command.aliases
                                else ""
                            )
                            + "\n\n**Description:**\n"
                            + (
                                command.help
                                if command.help
                                else "Under construction..."
                            )
                            + "\n\n**Usage:**\n"
                            + (
                                command.usage
                                if command.usage
                                else "> {prefix}{command}"
                            ).format(
                                prefix=self.bot.command_prefix, command=command.name
                            ),
                        )
                    )

*/
