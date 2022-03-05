import { Command } from "@sapphire/framework"

import type { PieceContext } from "@sapphire/framework"

export default abstract class CustomCommand extends Command {
	public constructor(context: PieceContext, options?: Command.Options) {
		super(context, {
			...options,

			// only allow commands to run in servers
			runIn: ["GUILD_TEXT"],
		})
	}
}
