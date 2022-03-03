import allToLowerCase from "../allToLowerCase"

test("lower case function does not ", () => {
	expect(
		allToLowerCase(["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"])
	).toStrictEqual(["abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyz"])
})
