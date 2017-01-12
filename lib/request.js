const url = require('url'),
    http = require('http');

module.exports = {
    get: (path, headers) => {
        return new Promise((resolve, reject) => {
            let options = url.parse(path),
                request;

            options.headers = headers || {};

            request = http.get(options, response => {
                let result = [];
                response.on('data', chunk => {
                  result.push(chunk)
                });
                response.on('end', _ => {
                    sendResponse(result, response, path, resolve, reject, 'GET');
                });
            });
            request.on('error', err => reject(err));
        });
    },

    post: (path, headers, data) => {
        return new Promise((resolve, reject) => {
            let options = url.parse(path),
                body = JSON.stringify(data),
                request;

            options.method = 'POST';
            options.headers = headers || {};
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(body);

            request = http.request(options, response => {

                let result = [];
                response.on('data', chunk => result.push(chunk));
                response.on('end', _ => {
                    sendResponse(result, response, path, resolve, reject, 'POST');
                });
            });
            request.on('error', err => reject(err));
            request.end(body);
        });
    },

    put: (path, headers, data) => {
        return new Promise((resolve, reject) => {
            let options = url.parse(path),
                body = JSON.stringify(data),
                request;

            options.method = 'PUT';
            options.headers = headers || {};
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(body);

            request = http.request(options, response => {
                let result = [];
                response.on('data', chunk => result.push(chunk));
                response.on('end', _ => {
                    sendResponse(result, response, path, resolve, reject, 'PUT');
                });
            });
            request.on('error', err => reject(err));
            request.end(body);
        });
    }
}

/**
 sendResponse
 commond function used by all methods to finalize a response.
**/
function sendResponse(result, response, path, resolve, reject, verb) {
      result = result.join('');
      try {
          result = JSON.parse(result);
          if (response.statusCode < 200 || response.statusCode > 299) {
              reject(new Error(`Failed to ${verb} ${path} (Status code: ${response.statusCode}) (Message: ${JSON.stringify(result)})`));
          } else {
              resolve(result);
          }
      } catch (e) {
          if (response.statusCode < 200 || response.statusCode > 299) {
              reject(new Error(`Failed to ${verb} ${path} (Status code: ${response.statusCode}) (Message: ${result})`));
          } else {
              resolve(result);
          }
      }
}
