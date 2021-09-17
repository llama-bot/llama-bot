interface LlamaBotSettings {
	clearEmojis?: string[]
	quotes?: string[]
}

interface LlamaBotServerData {
	settings: {
		enabledCogs: string[]
	}
	vars: {
		channels: string[]
		messages: string[]
		roles: string[]
	}
}

interface LlamaBotServers {
	[key: string]: LlamaBotServerData
}
