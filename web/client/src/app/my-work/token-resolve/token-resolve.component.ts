import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router'
import {CookieService} from 'ngx-cookie-service';
@Component({
  selector: 'app-token-resolve',
  templateUrl: './token-resolve.component.html',
  styleUrls: ['./token-resolve.component.scss']
})
export class TokenResolveComponent implements OnInit {

  constructor(private route: ActivatedRoute, private cookieService: CookieService, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let token = params['token'];
      console.log(token);
      this.cookieService.set("ASGjwt", token);
      window.location.replace("http://localhost:4200");
    })
  }

}
