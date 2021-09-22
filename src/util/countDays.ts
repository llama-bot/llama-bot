export default function (startDate: number, endDate: number): number {
	return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
}
