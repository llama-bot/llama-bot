import "@sapphire/framework"

declare module "@sapphire/framework" {
	export abstract class Command {
		usage: string
	}

	interface CommandOptions {
		usage?: string
	}
}
