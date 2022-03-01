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
