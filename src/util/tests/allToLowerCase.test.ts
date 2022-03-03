import allToLowerCase from "../allToLowerCase"

test("Does not contain any lowercase characters", () => {
	expect(
		allToLowerCase(["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"])
	).toStrictEqual(["abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"])
})
