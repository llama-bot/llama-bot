import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["penis"],
	description: `Measure user's pp length and arrange them in descending order.
Shortest length: 0  (\`8D\`).
Longest length:  30 (\`8==============================D\`).

This is 101% accurate.`,
})
export default class PPCommand extends Command {
	async run(message: Message, args: Args) {
		let description = ""
		let membersRaw = await args.repeat("string").catch(() => [])

		if (!membersRaw) {
			if (!message.member) {
				message.channel.send({
					embeds: [
						new MessageEmbed()
							.setTitle("Error")
							.setDescription("Failed to get user"),
					],
				})
				return
			}

			membersRaw = [message.author.id]
		}

		for (const memberRaw of membersRaw) {
			const numbersInString = memberRaw.match(/\d+/)
			if (!numbersInString) continue
			const memberID = numbersInString[0]
			if (!memberID) continue
			const userMention = Formatters.userMention(memberID)
			const size = this.snowflakeToNumber(parseInt(memberID))

			description += `**${userMention}'s size': (${size})**\n`
			description += `8${"=".repeat(size)}D\n`
		}

		message.channel.send({
			embeds: [new MessageEmbed().setTitle("pp").setDescription(description)],
		})
	}

	snowflakeToNumber(snowflake: number): number {
		return Math.round((Math.sin(snowflake) + 1) * 15) // maps 0~2 to 0~30
	}
}
