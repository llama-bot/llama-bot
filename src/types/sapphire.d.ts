import "@sapphire/framework"

declare module "@sapphire/framework" {
	abstract class Command {
		usage?: string
	}

	interface Preconditions {
		OwnersOnly: never
		NoDM: never
	}
}
