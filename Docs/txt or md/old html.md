```html
<div class="window">
    <div class="main-content-container">
      <div class="main-content">
        <form [formGroup]="jobSiteForm" (ngSubmit)="onSubmit()" *ngIf="dataReady">
          <!--<ion-list>-->
          <!-- WorkSite DB Location Keys -->
          <ion-grid class="worksite-primary-info-container">
            <ion-row>
              <ion-item class="worksite-primary-info">
                <ion-label fixed id="client">Client</ion-label>
                <ion-select id="client-select" formControlName="client">
                  <ion-option *ngFor="let client of clientList" [value]="client">{{client.fullName}}</ion-option>
                </ion-select>
              </ion-item>
              <ion-item class="worksite-primary-info">
                <ion-label fixed id="loc">Work-Site Location</ion-label>
                <ion-select id="loc-select" formControlName="location">
                  <ion-option *ngFor="let location of locationList" [value]="location">{{location.fullName}}</ion-option>
                </ion-select>
              </ion-item>
              <ion-item class="worksite-primary-info">
                <ion-label fixed id="loc2nd">Ancillary Work-Site ID</ion-label>
                <ion-select id="loc2nd-select" formControlName="loc2nd">
                  <ion-option *ngFor="let loc2nd of loc2ndList" [value]="loc2nd">{{loc2nd.fullName}}</ion-option>
                </ion-select>
              </ion-item>
              <ion-item id="item-loc-id">
                <ion-label fixed id="loc-id">Tech Class Identifier</ion-label>
                <ion-select id="loc-id-select" formControlName="locID">
                  <ion-option *ngFor="let locID of locIDList" [value]="locID">{{locID.fullName}}</ion-option>
                </ion-select>
              </ion-item>
            </ion-row>
          </ion-grid>

          <!-- WorkSite Details -->
          <ion-grid class="billing-address-container">
            <ion-row>
              <div formGroupName="address">
                <!--<ion-item-divider color="light">Address</ion-item-divider>-->
                <div formGroupName="street">
                  <label fixed>Street Address
                    <span><input type="text" formControlName="street1"></span>
                  </label>
                </div>
                <div>
                  <label fixed>City</label>
                  <input type="text" formControlName="city">
                </div>
                <div>
                  <label fixed>State</label>
                  <input type="text" formControlName="state">
                </div>
                <div>
                  <label fixed>ZIP</label>
                  <input type="text" formControlName="zip">
                </div>
              </div>
            </ion-row>
          </ion-grid>

          <!--<ion-row>
        <ion-item-group>
          <ion-item-divider color="light">Site Location Details</ion-item-divider>
          <ion-item>
          <ion-label fixed>Latitude</ion-label>
          <ion-input type="text" formControlName="latitude"></ion-input>
          </ion-item>
          <ion-item>
          <ion-label fixed>Longitude</ion-label>
          <ion-input type="text" formControlName="longitude"></ion-input>
          </ion-item>
          <ion-item>
          <ion-label fixed>Geofence Radius (meters)</ion-label>
          <ion-input type="text" formControlName="within"></ion-input>
          </ion-item>
        </ion-item-group>
        </ion-row>

        <ion-row>
        <ion-item-group>
          <ion-item>
          <ion-label fixed>Latitude</ion-label>
          <ion-input type="text" formControlName="latitude"></ion-input>
          </ion-item>
          <ion-item>
          <ion-label fixed>Longitude</ion-label>
          <ion-input type="text" formControlName="longitude"></ion-input>
          </ion-item>
          <ion-item>
          <ion-label fixed>Geofence Radius (meters)</ion-label>
          <ion-input type="text" formControlName="within"></ion-input>
          </ion-item>
        </ion-item-group>
</ion-row>-->


          <!-- Invoicing Details -->


          <!-- -->
          <!--<ion-grid class="site-loc-details-container">
        <ion-row>
        <ion-item-group formGroupName="billing_address">-->
          <!--<ion-item-divider color="light">Billing Address</ion-item-divider>-->
          <!--<ion-item formGroupName="street">
          <ion-label fixed>Billing Address</ion-label>
          <ion-input type="text" formControlName="street1"></ion-input>
          </ion-item>
          <ion-item>
           <ion-label fixed>Billing City</ion-label>
           <ion-input type="text" formControlName="city"></ion-input>
          </ion-item>
          <ion-item>
          <ion-label fixed>Billing State</ion-label>
          <ion-input type="text" formControlName="state"></ion-input>
          </ion-item>
          <ion-item>
          <ion-label fixed>Billing ZIP</ion-label>
          <ion-input type="text" formControlName="zip"></ion-input>
          </ion-item>
        </ion-item-group>
        </ion-row>
        <ion-row>
        </ion-row>
      </ion-grid>

      <ion-item-group>-->
          <!--<ion-item-divider color="light"></ion-item-divider>-->
          <!--<ion-item>
        <ion-label fixed>Account No.</ion-label>
        <ion-input type="text" formControlName="account_number"></ion-input>
        </ion-item>
        <ion-item>
        <ion-label fixed>Travel Time</ion-label>
        <ion-input type="text" formControlName="travel_time"></ion-input>
        </ion-item>
        <ion-item>
        <ion-label fixed>Per Diem Rate</ion-label>
        <ion-input type="text" formControlName="per_diem_rate"></ion-input>
        </ion-item>
        <ion-item>
        <ion-label fixed>Requires Preauth</ion-label>
        <ion-toggle formControlName="requires_preauth"></ion-toggle>
        </ion-item>
        <ion-item>
        <ion-label fixed>Requires Work Order Reports</ion-label>
        <ion-toggle formControlName="requires_invoice_woreports"></ion-toggle>
        </ion-item>
        <ion-item>
        <ion-label fixed>Account or Contract</ion-label>
        <ion-input type="text" formControlName="account_or_contract"></ion-input>
        </ion-item>
        <ion-item>
        <ion-label fixed>Billing Rate</ion-label>
        <ion-input type="number" formControlName="billing_rate"></ion-input>
        </ion-item>
      </ion-item-group>
      
      <ion-item>
        <button ion-item (click)="editSiteHours()">Site Hours</button>
      </ion-item>
      <ion-item>
        <ion-label fixed>Site Active</ion-label>
        <ion-toggle formControlName="site_active"></ion-toggle>
      </ion-item>-->
          <!--</ion-list>-->
          <button type="button" ion-button block (click)="cancel()">Cancel</button>
          <button type="submit" ion-button block color="favorite">Save</button>
        </form>
      </div>
    </div>
    <div class="map-col-container">
      <div class="map-col">
        <img src="../../assets/images/ios-image.svg" class="img-placeholder" />
      </div>
    </div>
  </div>
```
