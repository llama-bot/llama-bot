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
	async messageRun(message: Message, args: Args) {
		let description = ""
		const users: { id: string; length: number }[] = []
		let membersRaw = await args.repeat("string").catch(() => [])

		if (membersRaw.length <= 0) {
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
			const memberIDStr = numbersInString[0]
			if (!memberIDStr) continue
			const memberID = parseInt(memberIDStr)
			if (!memberID) continue

			try {
				users.push({
					id: memberIDStr,
					length: this.snowflakeToNumber(memberID),
				})
			} catch (e) {
				continue
			}
		}

		// sort users ascending by pp length
		users.sort((prev, curr) => curr.length - prev.length)

		for (const user of users) {
			const userMention = Formatters.userMention(user.id)

			description += `**${userMention}'s size': (${user.length})**\n`
			description += `8${"=".repeat(user.length)}D\n`
		}

		message.channel.send({
			embeds: [new MessageEmbed().setTitle("pp").setDescription(description)],
		})
	}

	snowflakeToNumber(snowflake: number): number {
		return Math.round((Math.sin(snowflake) + 1) * 15) // maps 0~2 to 0~30
	}
}
