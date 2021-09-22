export default function (input: string[], query: string): number {
	return input.findIndex((elem) => query.toLowerCase() === elem.toLowerCase())
}
