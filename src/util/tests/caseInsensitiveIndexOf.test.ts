import caseInsensitiveIndexOf from "../caseInsensitiveIndexOf"

test("Does not contain any lowercase characters", () => {
	expect(caseInsensitiveIndexOf(["A", "B", "C", "D"], "a")).toStrictEqual(0)
	expect(caseInsensitiveIndexOf(["A", "B", "C", "D"], "b")).toStrictEqual(1)
	expect(caseInsensitiveIndexOf(["A", "B", "C", "D"], "c")).toStrictEqual(2)
	expect(caseInsensitiveIndexOf(["A", "B", "C", "D"], "d")).toStrictEqual(3)
})
