/**
 * @file OS-independent build directory clean script
 */

import PrettyError from "pretty-error"
import rimraf from "rimraf"

const pe = new PrettyError()

rimraf("dist", (err) => {
	if (err) console.log(pe.render(err))
})
