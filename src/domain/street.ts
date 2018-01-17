/**
 * Name: Street domain class
 * Vers: 1.2.1
 * Date: 2017-12-07
 * Auth: David Sargeant
 * Logs: 1.2.1 2017-12-07: Changed toString method to check for empty street addresses
 */

export class Street {
  public street1:string;
  public street2:string;

  constructor(inStreet1?:string, inStreet2?:string) {
    this.street1 = inStreet1 || '';
    this.street2 = inStreet2 || '';
  }

  toString() {
    let outString = '';
    if(this.street2 && this.street1) {
      outString = `${this.street1}\n${this.street2}`;
    } else if(this.street1) {
      outString = `${this.street1}`;
    }
    return outString;
  }
}
