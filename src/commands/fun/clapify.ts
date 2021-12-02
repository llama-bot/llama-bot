import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["c", "clap"],
	description:
		"does the annoying Karen clap. Does not work with external emojis.",
})
export default class ClapifyCommand extends Command {
	async messageRun(message: Message, args: Args): Promise<void> {
		const inputs = await args.repeat("string").catch(() => [])

		if (!inputs) {
			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error!")
						.setDescription("What should I clapify?"),
				],
			})

			return
		}

		message.channel.send({
			embeds: [
				new MessageEmbed().setDescription(`**${Formatters.userMention(
					message.author.id
				)} says:**

${inputs.join(":clap:")}`),
			],
		})
	}
}
