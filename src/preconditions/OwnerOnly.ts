import { Precondition } from "@sapphire/framework"
import type { Message } from "discord.js"

import type { Snowflake } from "discord-api-types"

export class UserPrecondition extends Precondition {
	owners: Snowflake[] = ["501277805540147220"]

	public async run(message: Message) {
		return this.owners.includes(message.author.id)
			? this.ok()
			: this.error({ message: "This command can only be used by the owner." })
	}
}

declare module "@sapphire/framework" {
	interface Preconditions {
		OwnerOnly: never
	}
}
