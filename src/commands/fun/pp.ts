import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["penis"],
	description: `Measure user's pp length and arrange them in descending order.

Shortest length (0):
\`8D\`
Longest length (30):
\`8==============================D\`

This is 101% accurate.`,
})
export default class PPCommand extends Command {
	usage = `Measure yourself:
> ${process.env.PREFIX}pp

Measure someone else:
> ${process.env.PREFIX}pp <user>

You can even measure multiple people at once:
> ${process.env.PREFIX}pp <user1> <user2> ...
`

	async messageRun(message: Message, args: Args) {
		let membersRaw = await args.repeat("string").catch(() => [])

		//
		//  handle 0 argument case
		//

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

		//
		// Calculate pp lengths
		//

		const users: { id: string; length: number }[] = []

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
					length: this.calculatePPLength(memberID),
				})
			} catch (e) {
				continue
			}
		}

		// sort users ascending by pp length
		users.sort((prev, curr) => curr.length - prev.length)

		//
		// construct description
		//

		let description = ""

		for (const user of users) {
			const userMention = Formatters.userMention(user.id)

			description += `${userMention}:\n`
			description += `8${"=".repeat(user.length)}D **(${user.length})**\n`
		}

		//
		// Reply
		//

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "pp",
					description,
				}),
			],
		})
	}

	/**
	 * Convert snowflake to pp length
	 *
	 * @param {number} snowflake - Discord snowflake
	 */
	calculatePPLength(snowflake: number): number {
		return snowflake % 31
	}
}
