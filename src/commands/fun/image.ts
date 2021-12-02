import { Args, Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Formatters, Message, MessageEmbed } from "discord.js"
import NekoClient from "nekos.life"
import { FunctionKeys, $PropertyType } from "utility-types"

import { isChannelNSFW, caseInsensitiveIndexOf } from "../../util"
import { globalObject } from "../.."

type nsfwOptionsType = FunctionKeys<$PropertyType<NekoClient, "nsfw">>
type sfwOptionsType = Exclude<
	FunctionKeys<$PropertyType<NekoClient, "sfw">>,
	"why" | "catText" | "OwOify" | "8Ball" | "fact" | "spoiler"
>

@ApplyOptions<CommandOptions>({
	aliases: ["i", "img", "images"],
	description: "Shows some good images",
})
export default class ImageCommand extends Command {
	usage = `> \`${process.env.PREFIX}image <image category> <image type>\`

image category:
- nsfw & sfw (can be shortened to \`n\` and \`s\`)

image type:
- Use the \`${process.env.PREFIX}image list\` command to list available options.

e.g.

> \`${process.env.PREFIX}image sfw pat\`
`

	nsfwOptions: nsfwOptionsType[] = Object.getOwnPropertyNames(
		globalObject.nekosClient.nsfw
	) as nsfwOptionsType[]

	sfwOptions: sfwOptionsType[] = Object.getOwnPropertyNames(
		globalObject.nekosClient.sfw
	).filter(
		(elem) =>
			// the return values for these options do not have the url attribute
			!["why", "catText", "OwOify", "8Ball", "fact", "spoiler"].includes(elem)
	) as sfwOptionsType[]

	async messageRun(message: Message, args: Args): Promise<void> {
		const option1 = await args.pick("string").catch(() => "")
		const option2 = await args.pick("string").catch(() => "")

		// if options is empty or is "list"
		if (!option1 || !option2 || option1 === "list") {
			this.list(message)

			return
		}

		if (!["sfw", "nsfw"].includes(option1.toLowerCase())) {
			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error!")
						.setDescription("Option should be either `list`, `nsfw` or `sfw`"),
				],
			})

			return
		}

		message.channel.sendTyping()

		if (option1 == "nsfw") {
			const nsfwIndex = caseInsensitiveIndexOf(this.nsfwOptions, option2)
			if (nsfwIndex >= 0) {
				// check if channel is a NSFW channel
				if (!isChannelNSFW(message)) {
					message.channel.send({
						embeds: [
							new MessageEmbed()
								.setTitle("Error!")
								.setDescription(
									"You cannot run this command outside NSFW channels."
								),
						],
					})
					return
				}

				const result = await globalObject.nekosClient.nsfw[
					this.nsfwOptions[nsfwIndex]
				]()

				this.sendImage(message, result.url)
			} else {
				this.option2NotFound(message, option2)
			}

			return
		}

		if (option1 == "sfw") {
			const sfwIndex = caseInsensitiveIndexOf(this.sfwOptions, option2)

			if (sfwIndex >= 0) {
				const result = await globalObject.nekosClient.sfw[
					this.sfwOptions[sfwIndex]
				]()
				this.sendImage(message, result.url)
			} else {
				this.option2NotFound(message, option2)
			}

			return
		}
	}

	sendImage(message: Message, imageURL: string): void {
		if (!message.member) {
			message.channel.send({
				embeds: [
					new MessageEmbed()
						.setTitle("Error")
						.setDescription("Failed to identify command caller"),
				],
			})

			return
		}

		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Image")
					.setDescription(
						`requested by: ${Formatters.userMention(
							message.member.id
						)}\n**[Click if you don't see the image](${imageURL})**`
					)
					.setImage(imageURL)
					.setFooter("powered by nekos.life"),
			],
		})
	}

	option2NotFound(message: Message, option: string): void {
		message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("Error!")
					.setDescription(`Option \`${option}\` is not a valid option.`),
			],
		})

		this.list(message)
	}

	list(message: Message): void {
		message.channel.send({
			embeds: [
				new MessageEmbed().setTitle("Image Options").addFields(
					{
						name: "Usage",
						value: this.usage,
					},
					{
						name: "NSFW",
						value: `\`${this.nsfwOptions.join("`, `")}\``,
					},
					{
						name: "SFW",
						value: `\`${this.sfwOptions.join("`, `")}\``,
					}
				),
			],
		})
	}
}
