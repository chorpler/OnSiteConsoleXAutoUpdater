/**
 * Name: Address domain class
 * Vers: 1.4.1
 * Date: 2017-12-07
 * Auth: David Sargeant
 * Logs: 1.4.1 2017-12-07: Changed toString method to check for empty street addresses
 * Logs: 1.3.1 2017-11-14: Added country property
 * Logs: 1.2.2 2017-10-04: Fixed a zipcode initializing issue
 */

import { Street } from './street';

export class Address {
  public street:Street;
  public street1:string;
  public street2:string;
  public city:string;
  public state:string;
  public country:string;
  public get zip():string {return this.zipcode;};
  public set zip(value:string) { this.zipcode = value;};
  public zipcode:string;

  constructor(inStreet?:Street, inCity?:string, inState?:string, inZip?:string) {
    this.street  = inStreet || new Street();
    this.city    = inCity   || '';
    this.state   = inState  || '';
    this.country = "USA"         ;
    this.zipcode = inZip    || '';
  }

  public toString() {
    let outStreet = this.street.toString();
    let outString = '';
    if(outStreet) {
      outString = `${outStreet}\n${this.city} ${this.state} ${this.zipcode}`;
    } else {
      outString = `${this.city} ${this.state} ${this.zipcode}`;
    }
    return outString;
  }
}
