import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["si"],
	description: "Gets information about the server",
})
export default class ServerInfoCommand extends Command {
	async messageRun(message: Message) {
		const guild = message.guild

		if (!guild) {
			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error!")
						.setDescription("This command only works in servers"),
				],
			})
			return
		}

		const roles = await guild.roles.fetch()
		console.log(roles)
		const iconURL = guild.iconURL() || ""

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setAuthor(guild.name, iconURL)
					.setThumbnail(iconURL)
					.setDescription(
						`Owner: ${Formatters.userMention(guild.ownerId)}
Community server: 
Nitro boost count: XX (lvl X)
Scanning level: XXXXX
Verification level: XXXXX
Region: XXX`
					)
					.addField(
						"Creation date",
						`YYYY-MM-DD hh:mm:ss
X years X days X hours X minutes X second ago`
					)
					.addField(
						"Members",
						`total: ${guild.memberCount}
Online: XX
Human: XX
Bots: XX`
					)
					.addField(
						"Roles",
						`Total: ${roles.size}
Admin: X`
					)
					.addField(
						"Channels",
						`Text: XX/XXX
Voice: XX
Announcement: XX
Stage: XX
Open threads: XX`
					)
					.setFooter(`ID: ${guild.id}`),
			],
		})
	}
}
