import { Injectable    } from '@angular/core'              ;
import { Platform      } from 'ionic-angular'              ;
import { ServerService } from './server-service'           ;
import { DBService     } from './db-service'               ;
import { Log           } from '../config/config.functions' ;

@Injectable()
export class SmartAudio {

  public audioType  : string      = 'html5' ;
  public sounds     : any         = []      ;
  public blobs      : Array<Blob> = []      ;
  public multisounds: any         =         { } ;

  // constructor(public nativeAudio: NativeAudio, platform: Platform) {
  constructor(platform: Platform, public server: ServerService, public db:DBService) {

    // if (platform.is('cordova')) {
    //   this.audioType = 'native';
    // }

    window['consoleaudio'] = this;
  }

  preload(key, asset) {

    if (this.audioType === 'html5') {

      let audio = {
        key: key,
        asset: asset,
        type: 'html5'
      };

      this.sounds.push(audio);
      let blob = new Blob([asset], {type: 'file'});
      this.blobs.push(blob);

    }
    //  else {

    //   this.nativeAudio.preloadSimple(key, asset);

    //   let audio = {
    //     key: key,
    //     asset: key,
    //     type: 'native'
    //   };

    //   this.sounds.push(audio);
    // }

  }

  play(key) {
    let audio = this.sounds.find((sound) => {
      return sound.key === key;
    });
    if(audio) {
      if (audio.type === 'html5') {
        let audioAsset = new Audio(audio.asset);
        audioAsset.play();
      }
    } else {
      Log.w("Can't play sound with key: ", key);
    // else {
    //   this.nativeAudio.play(audio.asset).then((res) => { Log.l(res); }, (err) => {Log.e(err); });
    // }
    }
  }

  public preloadSounds() {
    return new Promise((resolve,reject) => {
      this.db.getSounds().then(res => {
        this.multisounds = res;
        Log.l("preloadSounds(): Success! Preloaded sounds:\n", this.multisounds);
        resolve(res);
      }).catch(err => {
        Log.l("preloadSounds(): Error getting sounds!");
        Log.e(err);
        reject(err);
      });
    });
  }

  public getRandomSound(key1?:string) {
    let key = null;
    if(key1) {
      key = key1;
    } else {
      let keys = Object.keys(this.multisounds);
      let max = keys.length;
      let choice = Math.floor(Math.random() * (max));
      key = keys[choice];
    }
    Log.l("getRandomSound(): Playing random sound from: ", key);
    let size = this.multisounds[key].length;
    let min = 0;
    let max = size - 1;
    let choice = Math.floor(Math.random() * size) + min;
    return this.multisounds[key][choice];
  }

  public playRandomSound(key?:string) {
    if(key) {
      if(this.multisounds && this.multisounds[key] && this.multisounds[key].length) {
        let sound = this.getRandomSound(key);
        let audio = new Audio(sound);
        audio.play();
      } else {
        Log.w(`playRandomSound(): Sounds for '${key}' not found!`);
      }
    } else {
      let sound = this.getRandomSound();
      let audio = new Audio(sound);
      audio.play();
    }
  }

}
