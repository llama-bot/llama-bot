import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

import { settings, fetchSettings } from "../../DB"

@ApplyOptions<CommandOptions>({
	aliases: ["l", "llamaQuote", "llamaQuotes", "lq"],
	description: "Shows a random llama quote.",
})
export default class LlamaCommand extends Command {
	usage = "> {$}"

	async messageRun(message: Message) {
		if (!settings.quotes) {
			await fetchSettings()
		}

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "Llama quote that'll make your day",
					description:
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						settings.quotes[Number(message.id) % settings.quotes.length],
				}),
			],
		})
	}
}
