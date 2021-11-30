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
				new MessageEmbed()
					.setTitle("Fact of the day")
					.setDescription((await globalObject.nekosClient.sfw.fact()).fact)
					.setFooter("powered by nekos.life"),
			],
		})
	}
}
