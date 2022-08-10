const http = require('http');
const https = require('https');
const { makeRequest } = require('../index.node');

/**
 * Hybrid HTTP Client for maximum and utmost performance
 * for each and every type of request.
 * 
 * Depending on the request type and protocol either a Node.js HTTP client 
 * is constructed and readied or a fully native and multithreaded Rust HTTP client.
 * 
 * Due to the nature of the technologies used HTTP clients are used for their best
 * case intended scenario to squeeze out every single last bit of performance.
 * 
 * @author knht
 */
class HTTPClient {
    /**
     * Constructs a new HTTPClient instance
     * 
     * @param {String} baseUrl The base url to make requests to
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.agent = 'TASKANA Benchmarking Suite (REST)';
    }

    /**
     * Make a request to a given endoint. This method - depending on the method - either
     * invokes a natively written HTTP client by the means of an FFI exposing libuv bindings
     * to Node.js, or a carefully constructed Node.js HTTP(S) client depending on the protocol.
     * 
     * GET requests are exclusively done on the Rust HTTP client, all other requests (mainly POST)
     * are piped through the Node.js HTTP client due to the nature of serialization of JSON data
     * when posting a body to an endpoint.
     * 
     * @param {String} endpoint The endpoint on the base URL to make the request towards
     * @param {String} method The HTTP method to make the request with (e.g. GET | POST | DELETE)
     * @param {Object} headers The headers to attach to the HTTP request (e.g. Authorization data)
     * @param {Object} body The body data to attach to the HTTP request (e.g. when POSTing)
     * @returns {Promise<Object>} A promise with the resulting data from the request
     */
    request(endpoint, method = 'GET', headers = {}, body = {}) {
        const preparedHeaders = Object.assign(headers, { 'User-Agent': this.agent });

        if (method === 'GET') {
            return makeRequest(this.baseUrl + endpoint, method, JSON.stringify(preparedHeaders));
        }

        return this._request(endpoint, method, headers, body);
    }

    /**
     * This method constructs a Node.js native HTTP(S) client (depending on the protocol specified in the base URL)
     * and pipes data per chunk into a receiver for later Resolving of the returned Promise with said data.
     * 
     * Private lifecycle method for internal use. See {@link HTTPClient#request} for API use.
     */
    _request(endpoint, method, headers, body) {
        const drivingModule = this.baseUrl.indexOf('https') === 0 ? https : http;
        const postedData = JSON.stringify(body);
        const requestOptions = {
            method,
            headers: Object.assign(headers, { 'User-Agent': this.agent }),
        };

        if (method.toUpperCase() === 'POST' && Object.keys(body).length > 0) {
            requestOptions.headers['Content-Length'] = postedData.length;
        }

        return new Promise((resolve, reject) => {
            const request = drivingModule.request(this.baseUrl + endpoint, requestOptions, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.once('end', () => {
                    let payload;

                    try {
                        payload = JSON.parse(data);
                    } catch (error) {
                        return reject(error);
                    }

                    resolve(payload);
                });
            });

            if (method.toUpperCase() === 'POST' && Object.keys(body).length > 0) {
                request.write(postedData);
            }

            request.end();
        });
    }
}

module.exports = HTTPClient;
