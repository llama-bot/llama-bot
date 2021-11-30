import "@sapphire/framework"

declare module "@sapphire/framework" {
	interface CommandOptions {
		usage?: string
	}

	abstract class Command {
		usage?: string
	}
}
