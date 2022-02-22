import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"

import { globalObject } from "../.."

@ApplyOptions<CommandOptions>({
	aliases: ["owoify"],
	description: "OwOifies youw message OwO",
})
export default class CatCommand extends Command {
	async messageRun(message: Message, args: Args) {
		message.channel.sendTyping()

		// combine all arguments to a single string
		const input = [...(await args.repeat("string").catch(() => ""))].join(" ")

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "OwO",
					description: `**${Formatters.userMention(message.author.id)} says:**

${
	(
		await globalObject.nekosClient.sfw.OwOify({
			text: input,
		})
	).owo
}`,
					footer: { text: "powered by nekos.life" },
				}),
			],
		})
	}
}
