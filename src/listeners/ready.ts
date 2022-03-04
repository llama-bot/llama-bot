import { ApplyOptions } from "@sapphire/decorators"
import { Listener } from "@sapphire/framework"
import { gray, yellow } from "colorette"

import type { ListenerOptions, Piece, Store } from "@sapphire/framework"

import { globalObject } from ".."

@ApplyOptions<ListenerOptions>({
	once: true,
})
export class Ready extends Listener {
	public run(): void {
		globalObject.startTime = Date.now()

		this.printReady()
		this.printMode()
		this.printStoreDebugInformation()
	}

	private printReady(): void {
		// prints: botusername#discriminator (botuserid) is Ready!
		console.log(
			gray(
				`${yellow(
					this.container.client.user?.tag || "unknown bot name"
				)} (ID: ${yellow(
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
		for (const store of this.container.client.stores.values())
			console.log(this.styleStore(store))
	}

	private styleStore(store: Store<Piece>): string {
		return gray(
			`Loaded ${yellow(store.size.toString().padEnd(3, " "))} ${store.name}.`
		)
	}
}
