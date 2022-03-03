/**
 * Finds the index of {@link query} in {@link input}.
 *
 * - Returns -1 if {@link query} was not found in {@link input}.
 *
 * @param {string[]} input - An array of string
 * @param {string} query - String to find
 */
export default function (input: string[], query: string): number {
	return input.findIndex((elem) => query.toLowerCase() === elem.toLowerCase())
}
