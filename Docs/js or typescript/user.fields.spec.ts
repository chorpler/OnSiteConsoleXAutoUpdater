export interface Street {
  street  : string; // Either a standalone street address, or built from street1 + "\n" + street2
  street1?: string;
  street2?: string;
}

export interface Address {
  street: Street;
  city: string;
  state: string;
  zip: string;
}

"(:+\d{1,2})?|(:\d)?"

export interface User {
  _id                 : string            = "org.couchdb.user:" + this.name ; // CouchDB requirement
  type                : string            = "user"   ; // another CouchDB requirement
  name                : string                       ; // username, thanks to CouchDB's required user structure
  roles               : Array<string>                ; // Required by CouchDB. "admin" or "manager" or "technician"
  password?           : string                       ; // Required by CouchDB but will be deleted and replaced with "password_scheme", "iterations", "derived_key", and "salt"
  username            : string            = this.name; // just because this makes more sense as a username
  avatarName          : string            = this.name; // For our purposes, known only to us and nobody else, so stop asking
  avtrNameAsUser      : Boolean                      ; // Kind of obsolete now, but it's coo'
  userClass           : Array<userClass>             ; // "TECHNICIAN" or "M-TECH" or "P-TECH" or "E-TECH" or "TOPPER"; need to add "ADMINISTRATIVE" and "MANAGER" for internal users
  prefix              : string                       ; // "Mr." or "Mrs." or whatever
  firstName           : string                       ;
  lastName            : string                       ;
  middleName          : string                       ;
  suffix              : string                       ; // "Sr." or "Jr." or "III" or whatever
  technician          : string                       ; // Actual name, last name first
  fullName            : string                       ; // Actual name, in proper order
  workSite            : string                       ; //
  client              : Array<client>                ;
  location            : Array<location>              ;
  locID               : Array<locID>                 ;
  loc2nd              : Array<loc2nd>                ;
  rotSeq              : string                       ; // "A" or "B" or "C" or ...
  rotation            : string                       ; // "FIRST WEEK" or "FINAL WEEK" or "CONTN WEEK" or "DAYS OFF"
  shift               : Array<string>                ; // "AM" or "PM"
  shiftLength         : string                       ; // number of hours shift is supposed to be, or "V" for vacation
  shiftStartTime      : number                       ; // 0 to 23, time of day shift starts at (are fractional values possible?)
  email               : Array<string>                ;
  phone               : string                       ; // has to be a string in case of international numbers, which start with a +
  cell                : string                       ; // another phone
  address             : Address                      ;
  payRate             : string | number              ; // number if Technician; if manager or internal staff use the string "Salary"
  active              : Boolean                      ; // whether or not the user is an active working employee (even if he is unassigned)
}
