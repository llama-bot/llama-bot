/**
 * Highlight a string in a list of entries using markdown syntax.
 *
 * - If {@link index} is -1 or is greater than the last index of {@link entries}, it will leave all entries un-highlighted.
 * - If {@link entries} does not contain any element, the resulting string will be empty.
 *
 * @param {number} index - Index of string to highlight
 * @param {string[]} entries - An array of strings that can be highlighted
 * @param {string} [separator=" / "] - What to put between
 */
export default function (
	entries: string[],
	index: number,
	separator = " / "
): string {
	entries = entries.map((elem, i) => {
		return i === index ? `**${elem}**` : elem
	})
	return entries.join(separator)
}
