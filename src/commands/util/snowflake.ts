import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { SnowflakeUtil, Message, MessageEmbed } from "discord.js"

import { formatDate, timeDiff } from "../../util"

@ApplyOptions<CommandOptions>({
	description: "Calculates when a discord ID (snowflake) was created.",
})
export default class SnowflakeCommand extends Command {
	async run(message: Message, args: Args) {
		let input: string

		try {
			input = await args.pick("string")
		} catch (e) {
			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error")
						.setDescription("You did not pass any snowflake to parse :("),
				],
			})
			return
		}

		try {
			const now = message.editedTimestamp || message.createdTimestamp
			const creationDate = SnowflakeUtil.deconstruct(input).date
			const formattedDiffDate = timeDiff(creationDate.getTime(), now)

			message.channel.send({
				embeds: [
					new MessageEmbed().addFields(
						{
							name: "Snowflake",
							value: input,
							inline: true,
						},
						{
							name: "Creation Date (UTC)",
							value: `${formatDate(creationDate)} (${formattedDiffDate} ago)`,
							inline: true,
						}
					),
				],
			})
		} catch (e) {
			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error")
						.setDescription(`Failed to parse snowflake \`${input}\``),
				],
			})
		}
	}
}
