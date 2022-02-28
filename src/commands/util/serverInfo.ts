import { Formatters, Message, MessageEmbed, SnowflakeUtil } from "discord.js"
import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"

import { formatDate, timeDiff } from "../../util"

@ApplyOptions<CommandOptions>({
	aliases: ["si"],
	description: "Gets information about the server",
})
export default class ServerInfoCommand extends Command {
	// todo: finish server info
	// todo: online users count
	// todo: human user accounts count and and bot accounts count
	usage = "> {$}"

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

		const iconURL = guild.iconURL() || ""

		const serverCreatedTime = SnowflakeUtil.deconstruct(guild.id)
		const whenWasServerCreated = formatDate(serverCreatedTime.date)
		const howLongAgoWasServerCreated = timeDiff(
			serverCreatedTime.date.getTime(),
			message.editedTimestamp || message.createdTimestamp
		)

		const channels = await guild.channels.fetch()

		let announcementChannelsCount = 0
		let textChannelsCount = 0
		let voiceChannelsCount = 0
		let stageChannelsCount = 0

		for (const [, channel] of channels) {
			if (channel.type === "GUILD_TEXT") textChannelsCount += 1
			if (channel.type === "GUILD_VOICE") voiceChannelsCount += 1
			if (channel.type === "GUILD_NEWS") announcementChannelsCount += 1
			if (channel.type === "GUILD_STAGE_VOICE") stageChannelsCount += 1
		}

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setAuthor(guild.name, iconURL)
					.setThumbnail(iconURL)
					.setDescription(
						`Owner: ${Formatters.userMention(guild.ownerId)}
${
	(guild.features.includes("PARTNERED") ? "- Partnered server" : "") +
	(guild.features.includes("COMMUNITY") ? "- Community server" : "")
}

Members: ${guild.memberCount} / ${guild.maximumMembers}
Roles: ${(await guild.roles.fetch()).size}
Nitro boosts: XX (lvl X)
Scanning level: XXXXX
Verification level: ${guild.verificationLevel.replace("_", " ").toLowerCase()}`
					)
					.addField(
						"Creation date",
						`Creation date in UTC (24h time): ${whenWasServerCreated}
						
${howLongAgoWasServerCreated} ago`
					)
					.addField(
						"Channels",
						`Channels: ${channels.size}
Text: ${textChannelsCount}
Voice: ${voiceChannelsCount}
Announcement: ${announcementChannelsCount}
Stage: ${stageChannelsCount}`
					)
					.addField(
						"Features",
						guild.features
							.map((feature) => `\`${feature.toLowerCase()}\``)
							.join(", ")
					)
					.setFooter(`ID: ${guild.id}`),
			],
		})
	}
}
