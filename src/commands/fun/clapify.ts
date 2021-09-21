import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["c", "clap"],
	description:
		"does the annoying Karen clap. Does not work with external emojis.",
})
export default class ClapifyCommand extends Command {
	async run(message: Message, args: Args) {
		const inputs = await args.repeat("string").then(() => [])

		if (!inputs)
			return message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error!")
						.setDescription("What should I clapify?"),
				],
			})

		message.channel.send(inputs.join(" :clap: "))
	}
}
