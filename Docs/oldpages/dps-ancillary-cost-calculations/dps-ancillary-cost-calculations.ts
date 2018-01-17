import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage({name: "DPS Ancillary Cost Calculatio"})
@Component({
  selector: 'page-dps-ancillary-cost-calculations',
  templateUrl: 'dps-ancillary-cost-calculations.html',
})
export class DpsAncillaryCostCalculationsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DpsAncillaryCostCalculationsPage');
  }

}
