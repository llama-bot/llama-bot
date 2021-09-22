import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["kitty", "catText"],
	description: "Sends a random cat emoji",
})
export default class CatCommand extends Command {
	async run(message: Message) {
		message.channel.send(
			(await this.container.client.nekosClient.sfw.catText()).cat
		)
	}
}
