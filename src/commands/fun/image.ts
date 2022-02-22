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
	"why" | "catText" | "OwOify" | "eightBall" | "fact" | "spoiler"
>

const nsfwOptions: nsfwOptionsType[] = Object.getOwnPropertyNames(
	globalObject.nekosClient.nsfw
) as nsfwOptionsType[]

const sfwOptions: sfwOptionsType[] = Object.getOwnPropertyNames(
	globalObject.nekosClient.sfw
).filter(
	(elem) =>
		// the return values for these options do not have the url attribute
		!["why", "catText", "OwOify", "eightBall", "fact", "spoiler"].includes(elem)
) as sfwOptionsType[]

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

You can also do \`${process.env.PREFIX}image help\` or \`${process.env.PREFIX}image list\` if you want to know what kind of images are available.
`

	async messageRun(message: Message, args: Args): Promise<void> {
		const option1 = (await args.pick("string").catch(() => "")).toLowerCase()
		const option2 = await args.pick("string").catch(() => "")

		//
		// Show help message
		//

		if (!option1 || !option2 || option1 === "list" || option1 === "help") {
			this.list(message)

			return
		}

		//
		// Handle invalid input
		//

		if (option1 != "sfw" && option1 != "nsfw") {
			message.channel.send({
				embeds: [
					new MessageEmbed({
						title: "Error!",
						description:
							"Option should be either `list`, `help`, `nsfw` or `sfw`",
					}),
				],
			})
		}

		//
		// Logic starts here
		//

		message.channel.sendTyping()

		//
		// Get option index
		//

		let index = -1

		if (option1 === "sfw") {
			index = caseInsensitiveIndexOf(nsfwOptions, option2)
		}

		if (option1 === "nsfw") {
			index = caseInsensitiveIndexOf(nsfwOptions, option2)
		}

		// check if option is valid
		if (index < 0) {
			this.option2NotFound(message, option2)

			return
		}

		//
		// check if the channel allows NSFW content
		//

		// todo: handle server-wide NSFW settings
		if (option1 === "nsfw" && !isChannelNSFW(message)) {
			message.channel.send({
				embeds: [
					new MessageEmbed({
						title: "Error!",
						description: "You cannot run this command outside NSFW channels.",
					}),
				],
			})

			return
		}

		//
		// Get image url
		//

		let url = ""
		if (option1 === "sfw") {
			url = (await globalObject.nekosClient.sfw[sfwOptions[index]]()).url
		}
		if (option1 === "nsfw") {
			url = (await globalObject.nekosClient.nsfw[nsfwOptions[index]]()).url
		}

		//
		// Send image
		//

		this.sendImage(message, url)
	}

	sendImage(message: Message, url: string): void {
		if (!message.member) {
			message.channel.send({
				embeds: [
					new MessageEmbed({
						title: "Error",
						description: "Failed to identify command caller",
					}),
				],
			})

			return
		}

		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "Image",
					description: `requested by: ${Formatters.userMention(
						message.member.id
					)}\n**[Click if you don't see the image](${url})**`,
					image: { url },
					footer: { text: "powered by nekos.life" },
				}),
			],
		})
	}

	option2NotFound(message: Message, option: string): void {
		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "Error!",
					description: `Option \`${option}\` is not a valid option.`,
				}),
			],
		})

		this.list(message)
	}

	list(message: Message): void {
		message.channel.send({
			embeds: [
				new MessageEmbed({
					title: "Image Options",
					fields: [
						{
							name: "Usage",
							value: this.usage,
						},
						{
							name: "NSFW",
							value: `\`${nsfwOptions.join("`, `")}\``,
						},
						{
							name: "SFW",
							value: `\`${sfwOptions.join("`, `")}\``,
						},
					],
				}),
			],
		})
	}
}
