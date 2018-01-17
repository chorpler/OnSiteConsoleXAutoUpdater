/**
 * Name: Jobsites domain class
 * Vers: 1.0.1
 * Date: 2017-08-14
 * Auth: David Sargeant
 */

import { sprintf                                           } from 'sprintf-js'                 ;
import { Log, moment, Moment, isMoment, oo                 } from '../config/config.functions' ;
import { Jobsite, Employee, Shift, Schedule, PayrollPeriod } from './domain-classes'           ;

export class Jobsites {
  public sites:Array<Jobsite> = [];
  constructor() {

  }
}
