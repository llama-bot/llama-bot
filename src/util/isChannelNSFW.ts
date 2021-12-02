import { Message } from "discord.js"

export default function (message: Message): boolean {
	return Reflect.get(message.channel, "nsfw") === true
}
