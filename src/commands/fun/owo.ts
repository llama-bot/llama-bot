import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["owoify"],
	description: "OwOifies youw message OwO",
})
export default class CatCommand extends Command {
	async run(message: Message, args: Args) {
		message.channel.sendTyping()

		const input = [...(await args.repeat("string").catch(() => ""))].join(" ")

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setDescription(
						`**${Formatters.userMention(message.author.id)} says:**\n\n${
							(
								await this.container.client.nekosClient.sfw.OwOify({
									text: input,
								})
							).owo
						}`
					)
					.setFooter("powered by nekos.life"),
			],
		})
	}
}
