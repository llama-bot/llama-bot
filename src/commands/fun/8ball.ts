import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["8", "ball"],
	description:
		"Gives you the best advice. We are not responsible for your action.",
})
export default class EightBallCommand extends Command {
	async run(message: Message, args: Args) {
		message.channel.sendTyping()

		const input = [...(await args.repeat("string").catch(() => ""))].join(" ")

		const response = await this.container.client.nekosClient.sfw["8Ball"]({
			text: input,
		})

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle(response.response)
					.setImage(response.url || ""),
			],
		})
	}
}
