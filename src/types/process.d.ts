declare namespace NodeJS {
	interface ProcessEnv {
		[key: string]: string | undefined
		TOKEN: string
		TESTING: string
		PREFIX_PROD: string
		PREFIX_DEV: string

		// default prefix currently being used
		PREFIX: string
	}
}
