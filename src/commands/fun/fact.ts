import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["f", "facts"],
	description: "Shows useless facts.",
})
export default class FactCommand extends Command {
	async run(message: Message) {
		message.channel.sendTyping()
		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Fact of the day")
					.setDescription(
						(await this.container.client.nekosClient.sfw.fact()).fact
					)
					.setFooter(
						`Requested by ${message.author.tag} (${message.author.id})`
					),
			],
		})
	}
}
