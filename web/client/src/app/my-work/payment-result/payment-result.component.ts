import { Component, OnInit } from '@angular/core';
import {MatProgressSpinner, ProgressSpinnerMode, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import {EventServiceService} from '../services/event-service.service';
import { first } from 'rxjs/operators';
import { LoginService } from '../services/login.service';
import {Router} from '@angular/router'
@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {

  constructor(private route: ActivatedRoute, private eventS: EventServiceService, private loginS: LoginService, private router: Router) {
    //const data = route.data;
    //console.log(data);
   }

  ngOnInit(): void {
    
    
  }

  ngAfterViewInit() {

    console.log(this.route);
    this.route.queryParams.subscribe(params => {
      let ids = params['id'];
      let names = ids.split(';');  
      this.eventS.socketOnUpdatePayment().pipe(first()).subscribe(data => {
        console.log(data);
        this.router.navigateByUrl('');
      })
  
      window.setTimeout(() => this.eventS.socketEmitUpdatePayment(names[0],true,this.loginS.user.userID,names[1]),2000);
    })
  }

}
