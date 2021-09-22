export default function getFunctionByName(functionName: string, context: any) {
	const namespaces = functionName.split(".")
	const functionToExecute = namespaces.pop()

	if (!functionToExecute) return

	for (let i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]]
	}

	// If the context really exists (namespaces), return the function or property
	if (context) {
		return context[functionToExecute]
	} else {
		return undefined
	}
}
