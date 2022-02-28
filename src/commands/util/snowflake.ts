import { SnowflakeUtil, Message, MessageEmbed } from "discord.js"
import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"

import { formatDate, timeDiff } from "../../util"

@ApplyOptions<CommandOptions>({
	aliases: ["s"],
	description: "Calculates when a discord ID (snowflake) was created.",
})
export default class SnowflakeCommand extends Command {
	usage = "> {$} <discord snowflake>"

	async messageRun(message: Message, args: Args) {
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

			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle(input)
						.addField("Creation Date (UTC)", formatDate(creationDate))
						.addField("Age", timeDiff(creationDate.getTime(), now)),
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
