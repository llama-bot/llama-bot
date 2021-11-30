import { Message, MessageEmbed } from "discord.js"
import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { globalObject } from "../.."

@ApplyOptions<CommandOptions>({
	aliases: ["kitty", "catText"],
	description: "Sends a random cat emoji",
})
export default class CatCommand extends Command {
	async messageRun(message: Message) {
		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle((await globalObject.nekosClient.sfw.catText()).cat)
					.setFooter("powered by nekos.life"),
			],
		})
	}
}
