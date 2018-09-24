const path = require("path")

const MESSY_PATH = path.resolve(process.env.HOME, ".messy")
const APPSTATE_FILE_PATH = path.resolve(MESSY_PATH, "tmp/appstate.json")

module.exports = {
  APPSTATE_FILE_PATH,
  MESSY_PATH,
}
