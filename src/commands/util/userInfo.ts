import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import {
	Formatters,
	GuildMember,
	Message,
	MessageEmbed,
	Permissions,
} from "discord.js"

import { formatDate, timeDiff } from "../../util"

@ApplyOptions<CommandOptions>({
	aliases: ["ui"],
	description: "Gets information about a user.",
})
export default class UserInfoCommand extends Command {
	async messageRun(message: Message, args: Args) {
		let user = await args.pick("user").catch(() => undefined)

		if (!user) user = message.author

		const avatarURL = user.avatarURL() || undefined

		const resultEmbed = new MessageEmbed()
			.setAuthor(user.tag, avatarURL)
			.setThumbnail(avatarURL || "")
			.setDescription(Formatters.userMention(user.id))
			.addField("Discord join date", this.formattedJoinDate(user.createdAt))
			.setFooter(`ID: ${user.id}`)

		if (message.guild) {
			const member = await this.getMemberFromMessage(message)

			if (member) {
				resultEmbed.addField(
					"Server join date",
					this.formattedJoinDate(member.joinedAt)
				)

				resultEmbed.addField(
					"Last message sent",
					"date or this member did not send any message yet."
				)

				resultEmbed.addField(
					"Permissions",
					this.getPermissionsString(member.permissions)
				)

				const roleMentions = this.getMemberRoles(member, message.guild.id)
				resultEmbed.addField(
					`Roles (${roleMentions.length})`,
					roleMentions.join(" ")
				)
			}
		}

		message.channel.send({
			embeds: [resultEmbed],
		})
	}

	formattedJoinDate(joinedAt: Date | null): string {
		let result = "Unknown"

		if (joinedAt) {
			const xAgo = timeDiff(joinedAt.getTime(), Date.now())

			result = `${formatDate(joinedAt)}\n${xAgo} ago`
		}

		return result
	}

	async getMemberFromMessage(message: Message): Promise<GuildMember | null> {
		const guild = message.guild
		if (!guild) return null

		return await guild.members.fetch(message.author.id).catch(() => null)
	}

	getPermissionsString(permissions: Permissions) {
		return [...Object.entries(permissions.serialize())]
			.filter((elem) => elem[1])
			.map((elem) => this.convertCase(elem[0]))
			.join(", ")
	}

	getMemberRoles(member: GuildMember, guildID: string): string[] {
		return [...member.roles.cache.entries()] // returns a list if [role_id, Role]
			.map((elem) => elem[0]) // only get role IDs
			.filter((value) => value != guildID) // remove @everyone role
			.map((id) => Formatters.roleMention(id)) // converts role ID to mention string
	}

	// converts "SOMETHING_LIKE_THIS" to "Something Like This"
	// from https://stackoverflow.com/a/32589289/12979111
	convertCase(input: string): string {
		return input
			.replace(/_/g, " ")
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
			.join(" ")
	}
}
