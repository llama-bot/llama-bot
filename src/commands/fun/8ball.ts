import { Message, MessageEmbed } from "discord.js"
import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"

import { globalObject } from "../.."

@ApplyOptions<CommandOptions>({
	aliases: ["8", "ball"],
	description:
		"Gives you the best advice you can get. We are not responsible for your action though.",
})
export default class EightBallCommand extends Command {
	async messageRun(message: Message, args: Args) {
		message.channel.sendTyping()

		//
		// Parse user input
		//

		let text = ""

		const allStr = await args.repeat("string").catch(() => "")

		if (typeof allStr === "string") {
			text = allStr
		}
		if (Array.isArray(allStr)) {
			text = allStr.join(" ")
		}

		//
		// Get response from nekos.life
		//

		const { response, url } = await globalObject.nekosClient.sfw["eightBall"]({
			text,
		})

		//
		// Reply
		//

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: response,
					image: { url },
					footer: { text: "powered by nekos.life" },
				}),
			],
		})
	}
}
