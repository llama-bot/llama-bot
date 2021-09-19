import { Command, CommandOptions, PieceContext } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["p", "pong", "latency"],
	description:
		"Measures communication delay (latency) in 1/1000 of a second, also known as millisecond (ms).",
})
export default class PingCommand extends Command {
	async run(message: Message) {
		// compute as early as possible
		const embedDescription = `**TR1GGERED** by ${message.author}`

		message.channel
			.send({
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
			.then((msg) =>
				msg.edit({
					embeds: [
						new MessageEmbed().setDescription(embedDescription).addFields(
							{
								name: "API latency",
								value: `${
									(msg.editedTimestamp || msg.createdTimestamp) -
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
			)
	}
}
