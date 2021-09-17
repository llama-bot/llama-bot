import { ApplyOptions } from "@sapphire/decorators"
import { SubCommandPluginCommand } from "@sapphire/plugin-subcommands"
import type { Message } from "discord.js"

@ApplyOptions<SubCommandPluginCommand.Options>({
	aliases: ["sc"],
	description: "A basic command with some subcommands",
	subCommands: [{ input: "list", default: true }, "add", "remove"],
})
export class UserCommand extends SubCommandPluginCommand {
	public async list(message: Message) {
		return message.channel.send("listing")
	}

	public async add(message: Message) {
		return message.channel.send("adding")
	}

	public async remove(message: Message) {
		return message.channel.send("removing")
	}
}
