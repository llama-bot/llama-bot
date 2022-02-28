import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	description: "Shows information about inviting the bot.",
})
export default class InviteCommand extends Command {
	usage = "> {$}"

	async messageRun(message: Message) {
		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "Sorry",
					description: `Sorry, but only the owner can invite the Llama bot.
Check the [documentation](https://docs.llama.developomp.com/docs/overview#can-i-use-this-bot-in-my-discord-server) for more information.`,
				}),
			],
		})
	}
}
