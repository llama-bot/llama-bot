import { SapphireClient } from "@sapphire/framework"
import dotenv from "dotenv"

dotenv.config()
if (!process.env.TOKEN) throw Error("Token not found!")

const client = new SapphireClient({
	baseUserDirectory: __dirname,
	defaultPrefix: "b-",
	intents: ["GUILDS", "GUILD_MESSAGES"],
})

client.once("ready", () => {
	console.log(`${client.user?.tag} (${client.user?.id}) is Ready!`)
})

client.login(process.env.TOKEN)
