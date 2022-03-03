/**
 * Highlight a string in a list of entries.
 * Highlighting uses markdown syntax.
 *
 * @param {number} index - Index of string to highlight
 * @param {string[]} entries - An array of strings that can be highlighted
 * @param {string} [separator=" / "] - What to put between
 */
export default function (
	index: number,
	entries: string[],
	separator = " / "
): string {
	entries = entries.map((elem, i) => {
		return i === index ? `**${elem}**` : elem
	})
	return entries.join(separator)
}
