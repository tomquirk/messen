const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

/**
 * Dumps the state of the Facebook API to a file
 * @param {Object} appstate object generated from fbApi.getAppState() method
 * @param {string} filepath file to save appstate to
 * @return {Promise}
 */
function saveAppState(appstate, filepath) {
  return new Promise((resolve, reject) =>
    mkdirp(path.dirname(filepath), mkdirpErr => {
      if (mkdirpErr) return reject(mkdirpErr);

      // ...then write the file
      return fs.writeFile(filepath, JSON.stringify(appstate), writeErr => {
        if (writeErr) return reject(writeErr);

        return resolve(appstate);
      });
    })
  );
}

module.exports = {
  saveAppState
};
