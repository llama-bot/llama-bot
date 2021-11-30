import { Message, MessageEmbed } from "discord.js"
import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"

import { globalObject } from "../.."

@ApplyOptions<CommandOptions>({
	aliases: ["8", "ball"],
	description:
		"Gives you the best advice. We are not responsible for your action.",
})
export default class EightBallCommand extends Command {
	async messageRun(message: Message, args: Args) {
		message.channel.sendTyping()

		const input = [...(await args.repeat("string").catch(() => ""))].join(" ")

		const response = await globalObject.nekosClient.sfw["8Ball"]({
			text: input,
		})

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(response.response)
					.setImage(response.url || "")
					.setFooter("powered by nekos.life"),
			],
		})
	}
}
