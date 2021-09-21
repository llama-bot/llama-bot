import "@sapphire/framework"
import NekoClient from "nekos.life"

declare module "@sapphire/framework" {
	export abstract class Command {
		usage: string
	}

	interface CommandOptions {
		usage?: string
	}

	class SapphireClient {
		startTime: number | undefined
		nekosClient: NekoClient
	}
}
