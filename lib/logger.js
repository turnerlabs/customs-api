module.exports = {
  error: error,
  info: info
}

function error(log) {
  console.error(JSON.stringify({error: log}));
}

function info(log) {
  console.log(JSON.stringify({info: log}));
}
