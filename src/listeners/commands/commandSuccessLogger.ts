import type {
	CommandSuccessPayload,
	ListenerOptions,
	PieceContext,
} from "@sapphire/framework"
import { Command, Events, Listener, LogLevel } from "@sapphire/framework"
import type { Guild, User } from "discord.js"

import { cyan } from "colorette"

export class UserEvent extends Listener<typeof Events.CommandSuccess> {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			event: Events.CommandSuccess,
		})
	}

	public run({ message, command }: CommandSuccessPayload) {
		const shard = this.shard(message.guild?.shardId ?? 0)
		const commandName = this.command(command)
		const author = this.author(message.author)
		const sentAt = message.guild ? this.guild(message.guild) : this.direct()
		this.container.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}`)
	}

	private shard(id: number) {
		return `[${cyan(id.toString())}]`
	}

	private command(command: Command) {
		return cyan(command.name)
	}

	private author(author: User) {
		return `${author.username}[${cyan(author.id)}]`
	}

	private direct() {
		return cyan("Direct Messages")
	}

	private guild(guild: Guild) {
		return `${guild.name}[${cyan(guild.id)}]`
	}
}
