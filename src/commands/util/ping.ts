import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["p", "pong", "latency"],
	description:
		"Measures communication delay (latency) in 1/1000 of a second, also known as millisecond (ms).",
})
export default class PingCommand extends Command {
	usage = "> {$}"

	async messageRun(message: Message) {
		const embedDescription = `**TR1GGERED** by ${message.author}`

		const response = await message.channel.send({
			embeds: [
				new MessageEmbed().setDescription(embedDescription).addFields(
					{
						name: "API Latency",
						value: "...",
						inline: true,
					},
					{
						name: "Bot latency",
						value: "...",
						inline: true,
					}
				),
			],
		})

		response.edit({
			embeds: [
				new MessageEmbed().setDescription(embedDescription).addFields(
					{
						name: "API latency",
						value: `${
							(response.editedTimestamp || response.createdTimestamp) -
							(message.editedTimestamp || message.createdTimestamp)
						}ms`,
						inline: true,
					},
					{
						name: "Bot latency",
						value: `${Math.round(this.container.client.ws.ping)}ms`,
						inline: true,
					}
				),
			],
		})
	}
}
