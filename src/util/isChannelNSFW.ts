import { Message, MessageEmbed } from "discord.js"

export default function (message: Message): boolean {
	const isChannelNSFW = Reflect.get(message.channel, "nsfw") === true

	if (!isChannelNSFW) {
		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Error!")
					.setDescription("You cannot run this command outside NSFW channels."),
			],
		})
	}

	return isChannelNSFW
}
