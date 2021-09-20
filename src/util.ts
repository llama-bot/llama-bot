function countDays(startDate: number, endDate: number): number {
	return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
}

function formatDate(date: Date): string {
	// YYYY-MM-DD hh:mm:ss
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

function timeDiff(startTime: number, endTime: number): string {
	// https://stackoverflow.com/a/13904120/12979111

	let diff = (endTime - startTime) / 1000

	const days = Math.floor(diff / (60 * 60 * 24))
	diff -= days * 60 * 60 * 24

	const hrs = Math.floor(diff / (60 * 60)) % 24
	diff -= hrs * 60 * 60

	const mins = Math.floor(diff / 60) % 60
	diff -= mins * 60

	// in theory the modulus is not required
	const secs = Math.round(diff % 60)

	return (
		(days ? `${days} days ` : "") +
		(hrs ? `${hrs} hours ` : "") +
		(mins ? `${mins} minutes ` : "") +
		(secs ? `${secs} seconds` : "")
	)
}

export { countDays, formatDate, timeDiff }
