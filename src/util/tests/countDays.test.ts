import countDays from "../countDays"

test("Does not contain any lowercase characters", () => {
	expect(
		countDays(
			new Date("2022/02/22").getTime(),
			new Date("2022/02/23").getTime()
		)
	).toStrictEqual(1)

	expect(
		countDays(
			new Date("2022/02/01").getTime(),
			new Date("2022/03/01").getTime()
		)
	).toStrictEqual(28)
})
