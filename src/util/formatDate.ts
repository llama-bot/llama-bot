/**
 * Formats {@link date} to `YYYY-MM-DD hh:mm:ss`.
 *
 * @param {Date} date - Raw date object
 */
export default function (date: Date): string {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}
