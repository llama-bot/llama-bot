export interface Settings {
	clearEmojis?: string[]
	quotes?: string[]
}

export interface ServerData {
	settings: {
		enabledCogs: string[]
	}
	vars: {
		channels: string[]
		messages: string[]
		roles: string[]
	}
}

export interface Servers {
	[key: string]: ServerData
}
