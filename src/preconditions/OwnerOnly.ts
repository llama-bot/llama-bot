import { Precondition } from "@sapphire/framework"
import type { Message } from "discord.js"

import type { Snowflake } from "discord-api-types"

export class UserPrecondition extends Precondition {
	// IDs of users who can run owners only commands
	// convert comma separated string to array and remove empty values
	// trailing comma and double comma can result in empty values
	owners: Snowflake[] = process.env.OWNER_IDS.split(",").filter((elem) => elem)

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
