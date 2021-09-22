import { createFunctionPrecondition } from "@sapphire/decorators"
import { Message } from "discord.js"
import { Snowflake } from "discord-api-types"

export default function ownersOnly() {
	// IDs of users who can run owners only commands
	// convert comma separated string to array and remove empty values
	// trailing comma and double comma can result in empty values
	const owners: Snowflake[] = process.env.OWNER_IDS.split(",").filter(
		(elem) => elem
	)

	return createFunctionPrecondition((message: Message): boolean =>
		owners.includes(message.author.id)
	)
}
