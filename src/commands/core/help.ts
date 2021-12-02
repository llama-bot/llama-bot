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
		const helpEmbed = new MessageEmbed().setTitle("Help").setDescription(
			`Use \`${process.env.PREFIX}help <command | category>\` command to get more information about a command or a command category.
This command is not case sensitive.`
		)

		helpEmbed.addField(
			"Categories",
			this.lowerCaseCategoryNames
				.map((categoryName) => `- \`${categoryName}\`\n`)
				.join(""),
			true
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
		let selectedCategoryName = ""

		this.commands.categories.map((categoryName) => {
			if (categoryName.toLowerCase() === query.toLowerCase())
				selectedCategoryName = categoryName
		})

		if (!selectedCategoryName) return

		const commandsInCategory = this.commands.filter((command) =>
			command.fullCategory.includes(selectedCategoryName)
		)

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(`${selectedCategoryName} commands`)
					.setDescription(
						`Use the \`${process.env.PREFIX}help <command>\` command to get more information about a command.
This command is not case sensitive.`
					)
					.addField(
						"commands",
						commandsInCategory
							.map((command) => `-\`${command.name}\`\n`)
							.join("")
					),
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
				new MessageEmbed().setTitle("Command not found").setDescription(
					`Command \`${query}\` was not found. Did you mean \`${mostLikelyGuess}\`?
You can also use the \`${process.env.PREFIX}help\` command to list all available commands.`
				),
			],
		})
	}
}
