/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');
const URL = 'https://api.ipify.org?format=json';
const fetchMyIP = function (callback) {
  // use request to fetch IP address from JSON API
  request(`${URL}`, (error, response, body) => {
    // edge case: request failed
    if (error) {
      return callback(error, null);
    }

    if (response.statusCode !== 200) {
      callback(
        Error(`Status Code ${response.statusCode} when fetching IP: ${body}`),
        null
      );
      return;
    }

    // request success
    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};

module.exports = { fetchMyIP };
