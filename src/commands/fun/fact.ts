import { Message, MessageEmbed } from "discord.js"
import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"

import { globalObject } from "../.."

@ApplyOptions<CommandOptions>({
	aliases: ["f", "facts"],
	description: "Shows useless facts.",
})
export default class FactCommand extends Command {
	async messageRun(message: Message) {
		message.channel.sendTyping()

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "Here's a fact for you",
					description: (await globalObject.nekosClient.sfw.fact()).fact,
					footer: { text: "powered by nekos.life" },
				}),
			],
		})
	}
}
