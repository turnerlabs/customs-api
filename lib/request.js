const url = require('url'),
    http = require('http');

module.exports = {
    get: (path, headers) => {
        return new Promise((resolve, reject) => {
            let options = url.parse(path),
                request;

            options.headers = headers || {};

            request = http.get(options, response => {
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error(`Failed to GET ${path} (Status code: ${response.statusCode})`));
                }

                let result = [];
                response.on('data', chunk => result.push(chunk));
                response.on('end', _ => {
                    result = result.join('');
                    try {
                        result = JSON.parse(result);
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error(`Failed to POST ${path} (Status code: ${response.statusCode}) (Message: JSON.stringify(result))`));
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error(`Failed to POST ${path} (Status code: ${response.statusCode}) (Message: result)`));
                        } else {
                            resolve(result);
                        }
                    }
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
                    result = result.join('');
                    try {
                        result = JSON.parse(result);
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error(`Failed to POST ${path} (Status code: ${response.statusCode}) (Message: ${JSON.stringify(result)})`));
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error(`Failed to POST ${path} (Status code: ${response.statusCode}) (Message: result)`));
                        } else {
                            resolve(result);
                        }
                    }
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
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error(`Failed to PUT ${path} (Status code: ${response.statusCode})`));
                }

                let result = [];
                response.on('data', chunk => result.push(chunk));
                response.on('end', _ => {
                    result = result.join('');
                    try {
                        result = JSON.parse(result);
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error(`Failed to POST ${path} (Status code: ${response.statusCode}) (Message: ${JSON.stringify(result)})`));
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(new Error(`Failed to POST ${path} (Status code: ${response.statusCode}) (Message: ${result})`));
                        } else {
                            resolve(result);
                        }
                    }
                });
            });
            request.on('error', err => reject(err));
            request.end(body);
        });
    }
}
