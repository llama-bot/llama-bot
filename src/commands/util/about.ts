import {
	Command,
	CommandOptions,
	version as SapphireFrameworkVersion,
} from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import {
	SnowflakeUtil,
	version as DJSVersion,
	Message,
	MessageEmbed,
} from "discord.js"

import { countDays, formatDate, timeDiff } from "../../util"
import { globalObject } from "../.."

@ApplyOptions<CommandOptions>({
	aliases: ["a", "u", "uptime"],
	description: "Shows basic information about the bot.",
})
export default class AboutCommand extends Command {
	async messageRun(message: Message) {
		// compute uptime as early as possible
		const now = message.editedTimestamp || message.createdTimestamp
		const startTime = globalObject.startTime
		if (!startTime || !this.container.client.id)
			return this.failedToGetStartTime(message)

		const formattedUptime = timeDiff(startTime, now)
		const botCreatedTime = SnowflakeUtil.deconstruct(this.container.client.id)
		const formattedBotCreationDate = formatDate(botCreatedTime.date)
		const botAgeInDays = countDays(botCreatedTime.date.getTime(), now)

		const serversCount = this.container.client.guilds.cache.size || 0

		message.channel.send({
			embeds: [
				new MessageEmbed().setTitle("About").addFields(
					{
						name: "Node version",
						value: process.versions.node,
						inline: true,
					},
					{
						name: "discord.js version",
						value: DJSVersion,
						inline: true,
					},
					{
						name: "Sapphire framework version",
						value: SapphireFrameworkVersion,
						inline: true,
					},
					{
						name: "Creation date in UTC",
						value: `${formattedBotCreationDate} (${botAgeInDays} days ago)`,
						inline: true,
					},
					{
						name: "Uptime",
						value: formattedUptime,
						inline: true,
					},
					{
						name: "Servers",
						value: `The bot is in ${serversCount} server${
							serversCount >= 1 ? "s" : ""
						}.`,
						inline: true,
					},
					{
						name: "Source Code",
						value: "https://github.com/llama-bot",
						inline: false,
					}
				),
			],
		})
	}

	failedToGetStartTime(message: Message): void {
		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Failed to run command")
					.setDescription(
						"The bot failed to get one or more information about the bot."
					),
			],
		})
	}
}
