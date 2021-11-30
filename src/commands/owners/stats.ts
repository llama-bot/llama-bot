import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"
import os from "os"

import ownersOnlyPrecondition from "../../preconditions/OwnersOnly"

@ApplyOptions<CommandOptions>({
	description: "Shows statistics about the bot",
})
export default class StatsCommand extends Command {
	@ownersOnlyPrecondition()
	async messageRun(message: Message) {
		const cpuData = os.cpus()
		const threadCount = cpuData.length
		const averageCPUSpeed =
			cpuData.reduce((prev, curr) => prev + curr.speed, 0) / threadCount

		const freeMem = os.freemem()
		const totalMem = os.totalmem()
		const usedMem = totalMem - freeMem

		message.channel.send({
			embeds: [
				new MessageEmbed().setTitle("Stats").addFields(
					{
						name: "CPU",
						value: `threads: ${threadCount}
Speed: ${this.fixedDecimal(averageCPUSpeed)} MHz`,
					},
					{
						name: "RAM",
						value: `Free: ${this.toGB(freeMem)} GiB (${this.fixedDecimal(
							(100 * freeMem) / totalMem
						)}%)
Used: ${this.toGB(usedMem)} GiB (${this.fixedDecimal(
							(100 * usedMem) / totalMem
						)}%)
Total: ${this.toGB(totalMem)} GiB`,
					},
					{
						name: "Shards",
						value: "data",
					},
					{
						name: "Servers",
						value: `There are ${
							this.container.client.guilds.cache.size || 0
						} servers in the cache`,
					}
				),
			],
		})
	}

	toGB(input: number): string {
		return this.fixedDecimal(input / 1024 ** 3)
	}

	fixedDecimal(input: number): string {
		return input.toFixed(1)
	}
}
