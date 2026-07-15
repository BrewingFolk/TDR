require('dotenv').config();
const { execSync } = require('child_process');

const port = process.env.PORT || 3000;

let pids = '';
try {
  pids = execSync(`lsof -ti tcp:${port}`).toString().trim();
} catch (err) {
  pids = '';
}

if (!pids) {
  console.log(`No process found on port ${port}.`);
  process.exit(0);
}

pids.split('\n').forEach((pid) => {
  execSync(`kill -9 ${pid}`);
  console.log(`Killed process ${pid} on port ${port}.`);
});
