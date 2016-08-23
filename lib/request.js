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
                    reject(new Error(`Failed to load page (Status code: ${response.statusCode})`));
                }

                let body = [];
                response.on('data', chunk => body.push(chunk));
                response.on('end', _ => {
                    body = body.join('');
                    try {
                        body = JSON.parse(body);
                        resolve(body);
                    }
                    catch (e) {
                        resolve(body);
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
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error(`Failed to post page (Status code: ${response.statusCode})`));
                }

                let result = [];
                response.on('data', chunk => result.push(chunk));
                response.on('end', _ => {
                    result = result.join('');
                    try {
                        result = JSON.parse(result);
                        resolve(result);
                    }
                    catch (e) {
                        resolve(result);
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
                    reject(new Error(`Failed to post page (Status code: ${response.statusCode})`));
                }

                let result = [];
                response.on('data', chunk => result.push(chunk));
                response.on('end', _ => {
                    result = result.join('');
                    try {
                        result = JSON.parse(result);
                        resolve(result);
                    }
                    catch (e) {
                        resolve(result);
                    }
                });
            });
            request.on('error', err => reject(err));
            request.end(body);
        });
    }
}
