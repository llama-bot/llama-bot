import type { ListenerOptions, PieceContext } from "@sapphire/framework"
import { Listener, Store } from "@sapphire/framework"
import { gray, yellow } from "colorette"

import nekosClient from "nekos.life"

export class UserEvent extends Listener {
	public constructor(context: PieceContext, options?: ListenerOptions) {
		super(context, {
			...options,
			once: true,
		})
	}

	public run(): void {
		this.container.client.nekosClient = new nekosClient()
		this.container.client.startTime = Date.now()

		this.printReady()
		this.printMode()
		this.printStoreDebugInformation()
	}

	private printReady(): void {
		// prints: botusername#discriminator (botuserid) is Ready!
		console.log(
			gray(
				`"${yellow(
					this.container.client.user?.tag || "unknown bot name"
				)}" (ID: ${yellow(
					this.container.client.user?.id || "unknown bot ID"
				)}) is Ready!`
			),
			"\n"
		)
	}

	private printMode(): void {
		console.log(
			gray("Mode:"),
			yellow(process.env.TESTING === "true" ? "DEVELOPMENT" : "PRODUCTION")
		)
	}

	private printStoreDebugInformation(): void {
		const { client, logger } = this.container
		const stores = [...client.stores.values()]
		const last = stores.pop()!

		for (const store of stores) logger.info(this.styleStore(store, false))
		logger.info(this.styleStore(last, true))
	}

	private styleStore(store: Store<any>, last: boolean): string {
		return gray(
			`Loaded ${yellow(store.size.toString().padEnd(3, " "))} ${store.name}.`
		)
	}
}
