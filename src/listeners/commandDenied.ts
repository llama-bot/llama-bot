import { Listener } from "@sapphire/framework"

import type { CommandDeniedPayload } from "@sapphire/framework"
import type { UserError } from "@sapphire/framework"

export class CommandDenied extends Listener {
	public async run(
		{ context, message: content }: UserError,
		{ message }: CommandDeniedPayload
	) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), "silent")) return

		return message.channel.send({
			content,
			allowedMentions: { users: [message.author.id], roles: [] },
		})
	}
}
