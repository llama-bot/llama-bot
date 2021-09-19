import { ApplyOptions } from "@sapphire/decorators"
import {
	Args,
	Command,
	CommandOptions,
	CommandStore,
} from "@sapphire/framework"
import { Message, MessageEmbed } from "discord.js"

import stringSimilarity from "string-similarity"

type QueryType = "empty" | "command" | "category" | "unknown"

@ApplyOptions<CommandOptions>({
	aliases: ["h"],
	description: "Shows list of helpful information about a command or a cog.",
	usage: `> ${process.env.PREFIX}{command} <cog | command | None>
ex:
List cogs:
> ${process.env.PREFIX}{command}
List commands in the \`core\` cog:
> ${process.env.PREFIX}{command} core
Shows info about \`ping\` command:
> ${process.env.PREFIX}{command} ping`,
})
export default class HelpCommand extends Command {
	commands: CommandStore = this.container.client.stores.get("commands")

	// lower case names of categories
	lowerCaseCategoryNames: string[] = []

	async run(message: Message, args: Args): Promise<void> {
		// todo: find ways to set it on command initialization
		if (this.lowerCaseCategoryNames.length <= 0) {
			this.lowerCaseCategoryNames = this.commands.categories.map((elem) =>
				elem.toLowerCase()
			)
		}

		const query: string = await args.pick("string").catch(() => "")
		const lowerCaseQuery = query.toLowerCase()
		const [queryType, command] = this.categorizeQuery(lowerCaseQuery)

		if (queryType == "empty") {
			this.sendDefaultHelpMessage(message)
		} else if (queryType == "command") {
			this.sendCommandHelpMessage(message, command!)
		} else if (queryType == "category") {
			this.sendCommandCategoryHelpMessage(message, query)
		} else {
			this.sendCommandNotFoundMessage(message, query)
		}
	}

	categorizeQuery(lowerCaseQuery: string): [QueryType, Command?] {
		if (!lowerCaseQuery) return ["empty"]

		if (this.lowerCaseCategoryNames.includes(lowerCaseQuery))
			return ["category"]

		const command = this.commands.find(
			(command: Command, key: string) =>
				key.toLowerCase() == lowerCaseQuery ||
				command.aliases
					.map((elem) => elem.toLowerCase())
					.includes(lowerCaseQuery)
		)
		if (command) return ["command", command]

		return ["unknown"]
	}

	sendDefaultHelpMessage(message: Message): void {
		const helpEmbed = new MessageEmbed()
			.setTitle("Help")
			.setDescription(
				`Type \`${process.env.PREFIX}help <command | category>\` to get more information about a command or a command category.`
			)

		this.commands.categories.forEach((elem) =>
			helpEmbed.addField(elem, "category description", true)
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

	sendCommandCategoryHelpMessage(message: Message, query: string): void {
		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(`Category`)
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
