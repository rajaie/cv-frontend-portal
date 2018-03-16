'use strict'
let commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

module.exports = {
  NODE_ENV: '"production"',
  API_HOST_PORT: JSON.stringify('https://api.myclinicview.com'),
  COMMIT_HASH: JSON.stringify(commitHash),
}
