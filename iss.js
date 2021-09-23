/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');
const fetchMyIP = function (callback) {
  const URL = 'https://api.ipify.org?format=json';

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

const fetchCoordsByIP = (ip, callback) => {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    // error (invalid domain, user offline)
    if (error) {
      callback(error, null);
      return;
    }

    // server error codes
    if (response.statusCode !== 200) {
      callback(
        Error(`Status Code ${response.statusCode} when fetching IP: ${body}`),
        null
      );
      return;
    }

    // success
    const { longitude, latitude } = JSON.parse(body);
    callback(null, { longitude, latitude });
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  const { longitude, latitude } = coords;
  const URL = `https://iss-pass.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`;

  request(URL, (error, response, body) => {
    // request error
    if (error) {
      callback(error, null);
      return;
    }

    // server error code
    if (response.statusCode !== 200) {
      callback(
        Error(`Status Code ${response.statusCode} when fetching IP: ${body}`),
        null
      );
      return;
    }

    // success
    const data = JSON.parse(body).response;
    callback(null, data);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (callback) {
  // empty for now
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, coordinates) => {
      if (error) {
        return callback("It didn't work!", error);
      }

      fetchISSFlyOverTimes(coordinates, (error, passTimes) => {
        if (error) {
          return callback("It didn't work!", error);
        }

        callback(null, passTimes);
      });
    });
  });
};

module.exports = {
  nextISSTimesForMyLocation,
};
