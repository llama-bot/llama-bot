export interface Settings {
	clear_emojis?: string[]
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
