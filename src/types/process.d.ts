declare namespace NodeJS {
	interface ProcessEnv {
		[key: string]: string | undefined
		TOKEN: string
		TESTING: string
		PREFIX: string
		PREFIX_TESTING: string
	}
}
