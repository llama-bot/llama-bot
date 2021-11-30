import { Command, CommandOptions } from "@sapphire/framework"
import { ApplyOptions } from "@sapphire/decorators"
import { Message, MessageEmbed } from "discord.js"

@ApplyOptions<CommandOptions>({
	aliases: ["l"],
	description: "Shows a random llama quote.",
})
export default class LlamaCommand extends Command {
	// self.quotes: list[str] = self.bot.settings["quotes"]
	// self.quotes_length = len(self.quotes)

	// # key: server snowflake, value: index array
	// self.quote_indices: dict[int, list[int]] = dict()

	// # key: server snowflake, value: current quote index of server
	// self.quote_current_index: dict[int, int] = dict()

	async messageRun(message: Message) {
		// server_snowflake: int = ctx.guild.id
		// # if server index array is not initialized
		// if server_snowflake not in self.quote_indices:
		//     self.quote_indices[server_snowflake] = list(range(self.quotes_length))
		//     random.shuffle(self.quote_indices[server_snowflake])
		// # if server current index is not set
		// if server_snowflake not in self.quote_current_index:
		//     self.quote_current_index[server_snowflake] = 0
		// await ctx.send(
		//     embed=discord.Embed(
		//         title="Llama quote that'll make your day",
		//         description=self.quotes[
		//             self.quote_indices[server_snowflake][
		//                 self.quote_current_index[server_snowflake]
		//             ]
		//         ],
		//     )
		// )
		// self.quote_current_index[server_snowflake] += 1
		// if self.quote_current_index[server_snowflake] > (self.quotes_length - 1):
		//     # reshuffle and reset index
		//     random.shuffle(self.quote_indices[server_snowflake])
		// self.quote_current_index[server_snowflake] = 0
	}
}
