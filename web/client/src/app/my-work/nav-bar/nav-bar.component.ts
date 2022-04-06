import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';
import {Router} from "@angular/router"
import { ThemeService } from '../../theme.service';
import { LoginService } from '../services/login.service';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
   @Output('loginF') loginF: EventEmitter<any> = new EventEmitter<any>();
   @Output('logoutF') logoutF: EventEmitter<any> = new EventEmitter<any>();
   map = 'Wydarzenia';
   locations = 'Miejscówki';
   login = 'Zaloguj się';
   eq = 'Ekwipunek';
  constructor(public route: Router, public themeS: ThemeService, public loginS: LoginService) { }
  ngOnInit(): void {
  }


loginFunc()
{
this.loginF.emit();
}
logoutFunc()
{
  this.logoutF.emit();
}
changeTheme()
{

  this.themeS._darkTheme = !this.themeS._darkTheme;
  console.log(this.themeS._darkTheme);
}
}
