export default function (date: Date): string {
	// YYYY-MM-DD hh:mm:ss
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}
