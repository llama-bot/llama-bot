import { ApplyOptions } from "@sapphire/decorators"
import { Listener } from "@sapphire/framework"
import { gray, yellow } from "colorette"

import type { ListenerOptions } from "@sapphire/framework"

import { globalObject } from ".."

@ApplyOptions<ListenerOptions>({
	once: true,
})
export class Ready extends Listener {
	run() {
		globalObject.startTime = Date.now()

		this.printReady()
		this.printMode()
		this.printStoreDebugInformation()
	}

	printReady(): void {
		// prints: botusername#discriminator (botuserid) is Ready!
		console.log(
			`${gray(
				`${yellow(
					this.container.client.user?.tag || "unknown bot name"
				)} (ID: ${yellow(
					this.container.client.user?.id || "unknown bot ID"
				)}) is Ready!`
			)}
`
		)
	}

	printMode(): void {
		console.log(
			`${gray("Mode:")}  ${yellow(
				process.env.TESTING === "true" ? "DEVELOPMENT" : "PRODUCTION"
			)}`
		)
	}

	printStoreDebugInformation(): void {
		for (const store of this.container.client.stores.values())
			console.log(
				gray(
					`Loaded ${yellow(store.size.toString().padEnd(3, " "))} ${
						store.name
					}.`
				)
			)
	}
}
