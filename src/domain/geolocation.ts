/**
 * Name: Geolocation domain class
 * Vers: 2.0.1
 * Date: 2017-08-04
 * Auth: David Sargeant
 */

import {moment, Moment} from '../config/config.functions';

/**
 * @type {DOMTimeStamp} is a representiation of a specific time, generally used for timestamps.
 * Thus, a variable of type `DOMTimeStamp' is just an integer, not a string.
 * The integer represents the number of milliseconds since the start of the Unix epoch (midnight on the morning of January 1, 1970 (UCT)).
 */
export type DOMTimeStamp = number;

/**
 * Geographic ooordinates system, specified by w3 and changed to be TypeScript.
 *
 * The geographic coordinate reference system used by the attributes in this interface is the World Geodetic System (2d) [WGS84]. No other reference system is supported.
 * - `latitude' and `longitude' are geographic coordinates specified in decimal degrees with 0-12 decimal places, depending on accuracy.
 * - `altitude' denotes the height of the position, specified in meters above the [WGS84] ellipsoid. If the implementation cannot provide altitude information, the value of this attribute must be null.
 * - `accuracy' denotes the accuracy level of the latitude and longitude coordinates. It is specified in meters and must be supported by all implementations. The value of `accuracy' must be a non-negative real number.
 * - `altitudeAccuracy' is specified in meters. If the implementation cannot provide altitude information, the value of this attribute must be null. Otherwise, the value of `altitudeAccuracy' attribute must be a non-negative real number.
 * - `accuracy' and `altitudeAccuracy' values returned by an implementation should correspond to a 95% confidence level.
 * - `heading' denotes the direction of travel of the hosting device and is specified in degrees, where 0° ≤ heading < 360°, counting clockwise relative to the true north. If the implementation cannot provide heading information, the value of this attribute must be null. If the hosting device is stationary (i.e. the value of the speed attribute is 0), then the value of `heading' must be NaN.
 * - `speed' denotes the magnitude of the horizontal component of the hosting device's current velocity and is specified in meters per second. If the implementation cannot provide speed information, the value of this attribute must be null. Otherwise, the value of `speed' must be a non-negative real number.
 *
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}




/**
 *  The Position interface is the container for the geolocation information returned by location providers.
 *  `coords' is an object of the Coordinates interface defined above.
 *  `timestamp' is a simple integer, representing the time the position described by `coords' was acquired.
 *  `timestamp' is actually a DOMTimeStamp object, which represents a number of milliseconds, generally since epoch start.
 */
export interface Position {
  coords: Coordinates;
  timestamp: DOMTimeStamp;
};

export class Location implements Position {
  public coords: Coordinates;
  public timestamp: DOMTimeStamp;

  constructor(inputCoords?: Coordinates, inputTimestamp?: DOMTimeStamp) {
    if(inputCoords && inputTimestamp) {
      this.coords = inputCoords;
      this.timestamp = inputTimestamp;
    } else if(inputCoords) {
      this.coords = inputCoords;
      this.timestamp = parseInt(moment().format('x'));
    } else {
      this.coords = new Coordinates();
      this.timestamp = parseInt(moment().format('x'));
    }
  }
}
