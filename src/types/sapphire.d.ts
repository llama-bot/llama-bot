import "@sapphire/framework"

declare module "@sapphire/framework" {
	abstract class Command {
		usage?: string
	}
}
