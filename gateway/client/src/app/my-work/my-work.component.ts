import { Component, OnInit} from '@angular/core';
import { LoginService } from './services/login.service';
import {EventServiceService} from './services/event-service.service'
import {CookieService} from 'ngx-cookie-service';
import { first, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: 'app-my-work',
  templateUrl: './my-work.component.html',
  styleUrls: ['./my-work.component.scss']
})
export class MyWorkComponent implements OnInit {
  token:String=null;

  data={};


  constructor(public route: Router, public loginS: LoginService, private cookieService: CookieService, public eventS: EventServiceService ) {

     this.token = cookieService.get( "ASGjwt" );
     if(this.token)
    {

      this.loginS.Login(this.token).pipe(first()).subscribe(data=>{
        this.loginS.user = data.body;
        this.loginS.logged=true;
      },e =>{cookieService.delete('ASGjwt');
    this.loginS.logged=false;})
    }
    else{
      console.log("No token");
    }
  }

  ngOnInit():void {

  }
  loginF()
  {
    window.location.replace("http://localhost:3000/auth/google");
  }
  logoutF()
  {
    this.cookieService.delete('ASGjwt');
    //this.route.navigate(['myWork/map'])
    this.loginS.user={userID:'', name:'', photo:''};
    this.loginS.logged=false;
    setTimeout(function(){location.reload();},50);
  }

}
