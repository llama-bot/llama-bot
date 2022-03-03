/**
 * Formats difference in time in a readable format.
 *
 * @param {number} startTime - Start date in millisecond
 * @param {number} endTime - End date in millisecond
 */
export default function (startTime: number, endTime: number): string {
	// https://stackoverflow.com/a/13904120/12979111

	let diffSec = (endTime - startTime) / 1000

	const years = Math.floor(diffSec / (60 * 60 * 24 * 365))
	diffSec -= years * 60 * 60 * 24 * 365

	const days = Math.floor(diffSec / (60 * 60 * 24))
	diffSec -= days * 60 * 60 * 24

	const hrs = Math.floor(diffSec / (60 * 60)) % 24
	diffSec -= hrs * 60 * 60

	const mins = Math.floor(diffSec / 60) % 60
	diffSec -= mins * 60

	// in theory the modulus is not required
	const secs = Math.round(diffSec % 60)

	return (
		(years ? `${years} years ` : "") +
		(days ? `${days} days ` : "") +
		(hrs ? `${hrs} hours ` : "") +
		(mins ? `${mins} minutes ` : "") +
		(secs ? `${secs} seconds` : "")
	)
}
