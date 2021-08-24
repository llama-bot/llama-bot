import { Command, CommandOptions, PieceContext } from "@sapphire/framework"
import { Message, MessageEmbed } from "discord.js"

export default class PingCommand extends Command {
	constructor(context: PieceContext, options: CommandOptions) {
		super(context, {
			...options,
			name: "ping",
			aliases: ["p"],
			description:
				"Measures communication delay (latency) in 1/1000 of a second, also known as millisecond (ms).",
		})
	}

	async run(message: Message) {
		// compute as early as possible
		const latency = Date.now() - message.createdTimestamp

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setDescription(`**TR1GGERED** by ${message.author}`)
					.addFields(
						{
							name: "Message latency",
							value: `${latency}ms`,
							inline: true,
						},
						{
							name: "Bot latency",
							value: `${this.context.client.ws.ping}ms`,
							inline: true,
						}
					),
			],
		})
	}
}
