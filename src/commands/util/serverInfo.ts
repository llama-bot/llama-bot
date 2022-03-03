import {
	Formatters,
	Guild,
	Message,
	MessageEmbed,
	SnowflakeUtil,
} from "discord.js"
import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"

import {
	formatDate,
	formatTimeDiff,
	highlightIndex,
	formatNumber,
} from "../../util"

interface Data {
	// general info
	guildName: string
	guildIconUrl: string
	guildOwner: string
	membersCount: number
	maxMembers: number | null
	communityStatus: string
	partneredStatus: string
	verifiedStatus: string
	ScanningStatus: string
	verificationStatus: string
	nitroBoosts: number
	boostLevel: number

	// creation date
	guildCreationDate: string
	guildAge: string

	// channels
	totalChannelCount: number
	textChannelCount: number
	voiceChannelCount: number
	announcementChannelCount: number
	stageChannelCount: number
	storeChannelCount: number
}

@ApplyOptions<CommandOptions>({
	aliases: ["si"],
	description: "Show information about the server",
})
export default class ServerInfoCommand extends Command {
	usage = "> {$}"

	// value of VerificationLevels from "discord.js/typings/enums"
	// DO NOT CHANGE!!
	verificationLevels = ["NONE", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]

	// value of ExplicitContentFilterLevels from "discord.js/typings/enums"
	// DO NOT CHANGE!!
	explicitContentFilterLevels = [
		"DISABLED",
		"MEMBERS_WITHOUT_ROLES",
		"ALL_MEMBERS",
	]

	// value of PremiumTiers from "discord.js/typings/enums"
	// DO NOT CHANGE!!
	premiumTiers = ["NONE", "TIER_1", "TIER_2", "TIER_3"]

	async messageRun(message: Message) {
		message.channel.sendTyping()

		if (!message.guild) {
			message.channel.send({
				embeds: [
					new MessageEmbed({
						title: "Error!",
						description: "This command only works in servers",
					}),
				],
			})

			return
		}

		this.reply(message, message.guild)
	}

	async getData(message: Message, guild: Guild): Promise<Data> {
		//
		// general info
		//

		const guildName = guild.name
		const guildIconUrl = guild.iconURL() || ""
		const guildOwner = Formatters.userMention(guild.ownerId)

		const membersCount = guild.memberCount
		const maxMembers = guild.maximumMembers

		const communityStatus = highlightIndex(
			guild.features.includes("COMMUNITY") ? 0 : 1,
			["Yes", "No"]
		)
		const partneredStatus = highlightIndex(
			guild.features.includes("PARTNERED") ? 0 : 1,
			["Yes", "No"]
		)
		const verifiedStatus = highlightIndex(
			guild.features.includes("VERIFIED") ? 0 : 1,
			["Yes", "No"]
		)

		const ScanningStatus = highlightIndex(
			this.explicitContentFilterLevels.indexOf(guild.explicitContentFilter),
			this.explicitContentFilterLevels
		)
		const verificationStatus = highlightIndex(
			this.verificationLevels.indexOf(guild.verificationLevel),
			this.verificationLevels
		)

		const nitroBoosts = guild.premiumSubscriptionCount || 0
		const boostLevel = this.premiumTiers.indexOf(guild.premiumTier)

		//
		// creation date
		//

		const serverCreatedTime = SnowflakeUtil.deconstruct(guild.id)
		const guildCreationDate = formatDate(serverCreatedTime.date)
		const guildAge = formatTimeDiff(
			serverCreatedTime.date.getTime(),
			message.editedTimestamp || message.createdTimestamp
		)

		//
		// channels
		//

		const channels = await guild.channels.fetch()

		const totalChannelCount = channels.size
		let textChannelCount = 0
		let voiceChannelCount = 0
		let announcementChannelCount = 0
		let stageChannelCount = 0
		let storeChannelCount = 0

		for (const [, channel] of channels) {
			if (channel.type === "GUILD_TEXT") textChannelCount += 1
			if (channel.type === "GUILD_VOICE") voiceChannelCount += 1
			if (channel.type === "GUILD_NEWS") announcementChannelCount += 1
			if (channel.type === "GUILD_STAGE_VOICE") stageChannelCount += 1
			if (channel.type === "GUILD_STORE") storeChannelCount += 1
		}

		return {
			// general info
			guildName,
			guildIconUrl,
			guildOwner,
			membersCount,
			maxMembers,
			communityStatus,
			partneredStatus,
			verifiedStatus,
			ScanningStatus,
			verificationStatus,
			nitroBoosts,
			boostLevel,

			// creation date
			guildCreationDate,
			guildAge,

			// channels
			totalChannelCount,
			textChannelCount,
			voiceChannelCount,
			announcementChannelCount,
			stageChannelCount,
			storeChannelCount,
		}
	}

	async reply(message: Message, guild: Guild): Promise<void> {
		const data = await this.getData(message, guild)

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: data.guildName,
					thumbnail: { url: data.guildIconUrl },

					description: `Owner: ${data.guildOwner}

Members: Capacity: ${formatNumber(data.membersCount)} / ${formatNumber(
						data.maxMembers
					)}

Community: ${data.communityStatus}
Partnered: ${data.partneredStatus}
Verified: ${data.verifiedStatus}

Scanning: ${data.ScanningStatus}
Verification: ${data.verificationStatus}

Nitro boosts: ${data.nitroBoosts} (Lv ${data.boostLevel})`,

					fields: [
						{
							name: "Creation date",
							value: `Creation date in UTC (24h time): ${data.guildCreationDate}

${data.guildAge} ago`,
						},

						{
							name: "Channels",
							value: `Channels: ${data.totalChannelCount}
Text: ${data.textChannelCount}
Voice: ${data.voiceChannelCount}
Announcement: ${data.announcementChannelCount}
Stage: ${data.stageChannelCount}
Store: ${data.storeChannelCount}`,
						},
					],
					footer: { text: `Server ID: ${guild.id}` },
				}),
			],
		})
	}
}
