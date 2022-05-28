import { Component, OnInit, Input, ViewEncapsulation, ChangeDetectorRef, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {fractionsSnackBarComponent} from '../Snackbars/fractions.component';
import {formErrorSnackBarComponent} from '../Snackbars/formError';
import {newEventSnackBarComponent} from '../Snackbars/newEvent';
import * as olProj from 'ol/proj';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import { LoginService } from '../services/login.service';
import {EventASG} from '../services/event';
import { Player } from '../services/player';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { EventServiceService } from '../services/event-service.service';
import { first } from 'rxjs/operators';
import { MatStepper } from '@angular/material/stepper';
@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}

  },{provide: MAT_DATE_LOCALE, useValue: 'pl-PL'}]
})
export class EventFormComponent implements OnInit{
  @Input() wsp: string;
  @Output('refreshFeatures') refreshFeatures: EventEmitter<any> = new EventEmitter<any>();
   coord;
    day=new Date().getDate();
    month = new Date().getMonth();
    year= new Date().getFullYear();
    minDate;
    replicas = ["Karabiny snajperskie", "Karabiny wyborowe", "Karabiny wsparcia", "Karabiny szturmowe", "Bliski dystans"];
  myFormInfo: FormGroup;
  FormFractions: FormGroup;
  myFormLimits: FormGroup;
  myFormDescirption: FormGroup;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef, private loginS: LoginService,
              private _adapter: DateAdapter<any>, private eventS: EventServiceService) {

   }

  ngOnInit(): void {
    console.log(this.day);
    this.minDate=new Date(this.year, this.month, this.day);
    console.log(this.minDate);
    this._adapter.setLocale('pl');
    this.myFormInfo = this.fb.group({
      nazwa: ['', Validators.required],
      miejsce: ['', Validators.required],
      termin: [ Date, Validators.required],
      rodzaj: ['', Validators.required],
      wspe: ['', Validators.required],
      oplata: 0,
  });

    this.FormFractions = this.fb.group({
      frakcje:this.fb.array([this.fb.group({strona:'',wielkosc:''})])
    });
    this.myFormLimits = this.fb.group({
      limity:this.fb.array([this.fb.group({limit:0}),this.fb.group({limit:0}),this.fb.group({limit:0}),this.fb.group({limit:0}),this.fb.group({limit:0})])
    });
    this.myFormDescirption=this.fb.group({
      opis: ['',Validators.required]
    });

  }

  public coorChange()
  {
    if (this.wsp !== ''){
    let coor =olProj.transform(this.wsp, 'EPSG:3857', 'EPSG:4326');
    var coorDigital=[];
    coorDigital[0]=Number(coor[0]).toFixed(2);
    coorDigital[1]=Number(coor[1]).toFixed(2);
    this.myFormInfo.patchValue({wspe:coorDigital});

    }
    else
    {
    this.coord = '';

    return '';
    }
  }
  get limity(){
    return this.myFormLimits.get('limity') as FormArray
  }
  get frakcjeForm(){
    return this.FormFractions.get('frakcje') as FormArray
  }
  addFraction(){
    const faction=this.fb.group({
      strona:'',
      wielkosc:''
    })
    this.frakcjeForm.push(faction);
  }
  deleteFraction(i){
    if(this.frakcjeForm.value.length==1)
    {
      this.snackBar.openFromComponent(fractionsSnackBarComponent, { duration: 5000,
        horizontalPosition: "center", verticalPosition: "top"})
    }
    else
    this.frakcjeForm.removeAt(i);
  }

  submit()
  {


    if(this.myFormInfo.valid && this.wsp!==''&& this.frakcjeForm.valid&& this.myFormLimits.valid && this.myFormDescirption.valid)
    {
    let arr: {strona:string, wielkosc:number, zapisani:Player[], otwarte: boolean}[]=[];
    for (let frakcja of this.frakcjeForm.controls)
          {

            arr.push({strona:frakcja.value.strona,wielkosc:frakcja.value.wielkosc, zapisani:Player[0]=[], otwarte: true })
          }
    let limits: number[]=[];
    for(let limit of this.limity.controls)
          {
            limits.push(Number(limit.value.limit));
          }
          console.log(this.myFormInfo.value.termin.getMonth());
    let newEvent: EventASG ={
          _id:'',
          organizator: {_id: this.loginS.user.userID, imie: this.loginS.user.name},
          nazwa: this.myFormInfo.value.nazwa,
          termin: this.myFormInfo.value.termin.getFullYear()+"-"+Number(this.myFormInfo.value.termin.getMonth()+Number(1))+"-"+this.myFormInfo.value.termin.getDate(),
          wsp: String(this.wsp),
          miejsce: this.myFormInfo.value.miejsce,
          oplata: this.myFormInfo.value.oplata,
          rodzaj: this.myFormInfo.value.rodzaj,
          limity: limits,
          roznica: 0,
          frakcje: arr,
          opis: this.myFormDescirption.value.opis
          }
    var to_refresh=true;
    console.log(newEvent);
    this.eventS.socketOnPostEvent().pipe(first()).subscribe(data => {
      console.log(data);
      newEvent._id=data.created_id;
      this.snackBar.openFromComponent(newEventSnackBarComponent,{duration: 5000,
      horizontalPosition: "center", verticalPosition: "top"});
      this.eventS.addEventInClient(newEvent);
      this.refreshFeatures.emit();
      this.myFormDescirption.reset();
      this.myFormDescirption.markAsPristine();
      this.myFormLimits.markAsPristine();
      this.myFormInfo.reset();
      this.myFormInfo.markAsPristine();
      this.myFormLimits.reset();
      this.frakcjeForm.reset();
      this.frakcjeForm.markAsPristine();

      to_refresh=false;
    });

    
    this.eventS.socketEmitPostEvent(newEvent);
    
   /* this.eventS.postEvent(newEvent).pipe(first()).subscribe(data=>{
            newEvent._id=data.created_id;
            this.snackBar.openFromComponent(newEventSnackBarComponent,{duration: 5000,
            horizontalPosition: "center", verticalPosition: "top"});
            this.eventS.addEventInClient(newEvent);
            this.refreshFeatures.emit();
            this.myFormDescirption.reset();
            this.myFormDescirption.markAsPristine();
            this.myFormLimits.markAsPristine();
            this.myFormInfo.reset();
            this.myFormInfo.markAsPristine();
            this.myFormLimits.reset();
            this.frakcjeForm.reset();
            this.frakcjeForm.markAsPristine();

            to_refresh=false;
          });*/
    }
    else{
      this.snackBar.openFromComponent(formErrorSnackBarComponent,{ duration: 5000,
        horizontalPosition: "center", verticalPosition: "top"});
    }
  }
  public markTouchedInfo(stepper: MatStepper): void
  {
    this.myFormInfo.markAllAsTouched();
    if (this.myFormInfo.valid===true){
    stepper.next();
    console.log('why does it work');
    }
  }
  public markTouchedFractions(stepper: MatStepper): void
  {
    this.FormFractions.markAllAsTouched();
    if (this.FormFractions.valid===true){
      stepper.next();

    }
  }
  public markTouchedLimits(stepper: MatStepper): void
  {
    this.myFormLimits.markAllAsTouched();
    if (this.myFormLimits.valid===true){
    stepper.next();
    }
  }
}
