import { Message, MessageEmbed } from "discord.js"

export default function (message: Message): boolean {
	return Reflect.get(message.channel, "nsfw") === true
}
