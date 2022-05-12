import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
public  _darkTheme:boolean ;

  constructor() {
    this._darkTheme=false;
  }


}
