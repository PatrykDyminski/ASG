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
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}

  },{provide: MAT_DATE_LOCALE, useValue: 'pl-PL'}]
})
export class EventEditorComponent implements OnInit{
  @Input() ev: EventASG;
    day=new Date().getDate();
    month = new Date().getMonth();
    year= new Date().getFullYear();
    minDate;
    editedEv;
    replicas = ["Karabiny snajperskie", "Karabiny wyborowe", "Karabiny wsparcia", "Karabiny szturmowe", "Bliski dystans"];
  myFormInfo: FormGroup;
  FormFractions: FormGroup;
  myFormLimits: FormGroup;
  myFormDescirption: FormGroup;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef, private loginS: LoginService,
              private _adapter: DateAdapter<any>, private eventS: EventServiceService) {

   }

  ngOnInit(): void {
    this.editedEv=this.ev;
    var coordinates=this.editedEv.wsp.split(',');
    const coor = olProj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    const coorDigital=[];
    coorDigital[0]=Number(coor[0]).toFixed(2);
    coorDigital[1]=Number(coor[1]).toFixed(2);
    let data;
    data=this.editedEv.termin.split(',');

    console.log(this.editedEv);
    this.minDate=new Date(this.year, this.month, this.day);
    console.log(this.minDate);
    this._adapter.setLocale('pl');
    this.myFormInfo = this.fb.group({
      nazwa: [this.editedEv.nazwa, Validators.required],
      miejsce: [{value:this.editedEv.miejsce,disabled:true}, Validators.required],
      termin: [ new Date(this.editedEv.termin), Validators.required],
      rodzaj: [{value:this.editedEv.rodzaj,disabled:true}, Validators.required, ],
      wspe: [{value: coorDigital, disabled: true}, Validators.required],
      oplata: 0,
  });
   // this.minDate = Date.parse(this.editedEv.termin);
    this.FormFractions = this.fb.group({
      frakcje:this.fb.array([this.fb.group({strona:''})])
    });
    this.addFractions();
    this.myFormLimits = this.fb.group({
      limity:this.fb.array([this.fb.group({limit:0})])
    });
    this.myFormDescirption=this.fb.group({
      opis: [this.editedEv.opis,Validators.required]
    });
    this.addLimity();

  }


  get limity(){
    return this.myFormLimits.get('limity') as FormArray
  }
  get frakcjeForm(){
    return this.FormFractions.get('frakcje') as FormArray
  }
  addFractions(){
    this.frakcjeForm.clear();
    for(let frakcja of this.ev.frakcje)
    {
    const faction=this.fb.group({
      strona:frakcja.strona,
      zapisani: frakcja.zapisani,
      wielkosc: frakcja.wielkosc,
      otwarte: frakcja.otwarte
    })
    this.frakcjeForm.push(faction);
  }
  }
  addFraction(){
    const faction=this.fb.group({
      strona:'',
      wielkosc:''
    })
    this.frakcjeForm.push(faction);
  }
  addLimity()
  {
    this.limity.clear();
    for(let limit of this.ev.limity)
    {
      const lim = this.fb.group({
        limit: limit
      })
    this.limity.push(lim);
    }
  }

  public getZapisani(i:number): number
  {
    return this.ev.frakcje[i].zapisani.length;
  }

  public closeTheFraction(i, bool)
  {
    this.frakcjeForm.controls[i].patchValue({otwarte: bool});
  }

  submit()
  {
    this.myFormDescirption.markAllAsTouched();
    if(this.myFormInfo.valid && this.frakcjeForm.valid&& this.myFormLimits.valid && this.myFormDescirption.valid)
    {
    let arr: {strona:string, wielkosc:number, zapisani:Player[], otwarte: boolean}[]=[];
    for (let frakcja of this.frakcjeForm.controls)
          {
            if(frakcja.value.zapisani===null)
            {
              arr.push({strona:frakcja.value.strona,wielkosc:frakcja.value.wielkosc, zapisani:Player[0]=[], otwarte: frakcja.value.otwarte })
            }
            else
            arr.push({strona:frakcja.value.strona,wielkosc:frakcja.value.wielkosc, zapisani:frakcja.value.zapisani, otwarte: frakcja.value.otwarte })
          }
    let limits: number[]=[];
    for(let limit of this.limity.controls)
          {
            limits.push(Number(limit.value.limit));
          }
    let newEvent: EventASG ={
          _id:this.editedEv._id,
          organizator: this.editedEv.organizator,
          nazwa: this.myFormInfo.value.nazwa,
          termin:this.myFormInfo.value.termin.getFullYear() +"-"+Number(this.myFormInfo.value.termin.getMonth()+Number(1))+"-"+this.myFormInfo.value.termin.getDate(),
          wsp: String(this.editedEv.wsp),
          miejsce: this.editedEv.miejsce,
          oplata: this.myFormInfo.value.oplata,
          rodzaj: this.editedEv.rodzaj,
          limity: limits,
          roznica: 0,
          frakcje: arr,
          opis: this.myFormDescirption.value.opis
          }

    console.log(newEvent);
    this.eventS.socketOnUpdateEvent().pipe(first()).subscribe(data => {
      console.log(data);
      this.snackBar.openFromComponent(newEventSnackBarComponent,{duration: 5000,
        horizontalPosition: "center", verticalPosition: "top"});
        this.eventS.updateEventInClient(newEvent);
        this.myFormInfo.reset();
        this.myFormLimits.reset();
        this.FormFractions.reset();
        this.myFormDescirption.reset();
        this.eventS.eventToEdit=null;
    });
    this.eventS.socketEmitUpdateEvent(newEvent);
   /* this.eventS.updateEvent(newEvent).pipe(first()).subscribe(data=>{

            this.snackBar.openFromComponent(newEventSnackBarComponent,{duration: 5000,
            horizontalPosition: "center", verticalPosition: "top"});
            this.eventS.updateEventInClient(newEvent);
            this.myFormInfo.reset();
            this.myFormLimits.reset();
            this.FormFractions.reset();
            this.myFormDescirption.reset();
            this.eventS.eventToEdit=null;

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
