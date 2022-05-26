import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError,map} from 'rxjs/operators';
import {EventASG} from './event';
import { IfStmt } from '@angular/compiler';
import {Socket} from 'ngx-socket-io';



@Injectable({
  providedIn: 'root'
})
export class EventServiceService {

  public eventsList: EventASG[] = [];
  public eventsListSearch: EventASG[] = [];
  public eventsListPaginator: EventASG[] = [];
  public userEvents: EventASG[] = [];
  public userEventsPaginator: EventASG[] = [];
  public eventToEdit: EventASG = null;

  
  url='http://127.0.0.1:3000';
  constructor(private http: HttpClient, private socket: Socket) {
    //this.socket = io(this.socketUrl)
  }
  
 


  

  public setPaginatorList(index: number)
  {
    this.eventsListPaginator=[];
    if ((index + 1) * 10 > this.eventsListSearch.length)
    {
      for (let i = index * 10; i < this.eventsListSearch.length; i++)
      {
        this.eventsListPaginator.push(this.eventsListSearch[i]);
      }
    }
    else{
      for (let i = index * 10; i < (index + 1) * 10; i++)
      {
        this.eventsListPaginator.push(this.eventsListSearch[i]);
      }
    }
  }
  //dodac w parametrach info o oplaceniu w trakcie zapisywania, na razie false
  public  joinFraction(event:string, faction:string, user:string, name:string, czy_oplacone: boolean):Observable<any>
  {
    //const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
    const options = {_id:event, strona:faction, _idGracz:user, gracz:name, czy_oplacone: false}
    const header = new Headers();
    header.append('Content-Type','application/json; charset=utf-8');
    //console.log(options);
    return this.http.put(this.url+'/api/signUser',{headers: header, params: options})
     .pipe(
       catchError(this.handleError)
     );
  }

  public socketEmitJoinFraction(event:string, faction:string, user:string, name:string, czy_oplacone: boolean)
  {
    const options = {_id:event, strona:faction, _idGracz:user, gracz:name, czy_oplacone: false};
    this.socket.emit('joinFraction',options);
  }

  public socketOnJoinFraction():Observable<any>
  {
    return this.socket.fromEvent('joinFraction').pipe();
  }



  public leaveFraction(event:string, player:string):Observable<any>{
    //const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
    const data= {_id:event, gracz: player};
    return this.http.put(this.url+'/api/unsignUser', data ).pipe(catchError(this.handleError));
  }
public socketEmitLeaveFraction(event:string, player:string)
  {
    const data= {_id:event, gracz: player};
    this.socket.emit('leaveFraction', data);
  }

  public socketOnLeaveFraction():Observable<any>
  {
    return this.socket.fromEvent('leaveFraction').pipe();
  }

  public addPlayerInClient(event: string, side:string, _idGracz: string, name: string, czy_oplacone: boolean)
  {
    for(let ev of this.eventsList){
      if (ev._id===event)
      {
        for(let fraction of ev.frakcje)
        {
          if(fraction.strona===side)
          {
            fraction.zapisani.push({_id:_idGracz, imie: name, czy_oplacone:false});
          }
        }
      }
    }
  }

  public deletePlayerInClient(event: string, side:string, _idGracz: string)
  {
    for(let ev of this.eventsList){
      if (ev._id===event)
      {
        for(let fraction of ev.frakcje)
        {
          if(fraction.strona===side)
          {
            fraction.zapisani.forEach((item,index)=>{
              if(item._id===_idGracz) fraction.zapisani.splice(index,1);
            })
          }
        }
      }
    }
  }
  public postEvent(event: EventASG):Observable<any>
  {
//const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
    return this.http.post(this.url+'/api/event', event ).pipe(catchError(this.handleError));
  }

  public socketEmitPostEvent(event: EventASG)
  {
    this.socket.emit('postEvent', event);
  }

  public socketOnPostEvent():Observable<any>
  {
    return this.socket.fromEvent('postEvent').pipe(catchError(this.handleError));
  }


  public updateEvent(event: EventASG):Observable<any>
  {
    //const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
    return this.http.put(this.url+'/api/updateEvent', event).pipe(catchError(this.handleError));
  }
  public socketEmitUpdateEvent(event: EventASG)
  {
    this.socket.emit('updateEvent', event);
  }

  public socketOnUpdateEvent():Observable<any>
  {
    return this.socket.fromEvent('updateEvent').pipe(catchError(this.handleError));
  }



  public  getEvents(){
    //const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
  const x =  this.http.get<EventASG[]>(this.url+'/api/events').pipe(catchError(this.handleError));
  return x;
  }

  public socketEmitGetEvents()
  {
    this.socket.emit('getEvents',"null");
  }

  public socketOnGetEvents():Observable<any>
  {
    return this.socket.fromEvent('getEvents').pipe();
  }


  deleteEvent(event: EventASG):Observable<any>{
    const options = {_id:String(event._id)};
    console.log(options);
    //const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
  return  this.http.delete(this.url+'/api/deleteEvent', {params:options}).pipe(catchError(this.handleError));
  }

  public socketEmitDeleteEvent(event:EventASG)
  {
    const options = {_id:String(event._id)};
    this.socket.emit('deleteEvent',options);
  }

  public socketOnDeleteEvent():Observable<any>
  {
    return this.socket.fromEvent('deleteEvent').pipe(catchError(this.handleError));
  } 
  public handleError(er:HttpErrorResponse){
    return throwError('Something went wrong, try again');
  }
  public addEventInClient(event: EventASG)
  {
    this.eventsList.push(event);
    this.fillUsersEvents(event.organizator._id);
    this.setPaginatorList(0);
    this.setPaginatorUsersEvents(0);
  }

  public fillUsersEvents(user_id: string)
  {
    this.userEvents=[];
    for(let ev of this.eventsList){

      if(ev.organizator._id===user_id)
      {
        this.userEvents.push(ev);
      }
      else{
        for(let fraction of ev.frakcje)
        {

            for(let player of fraction.zapisani)
            {
              if(player._id === user_id)
              {
                this.userEvents.push(ev);
              }
            }
        }
      }
    }
  }
  updateEventInClient(event: EventASG)
  {
    for(let i=0;i<this.eventsList.length;i++)
    {
      if(this.eventsList[i]._id===event._id)
      {
        this.eventsList[i]=event;
        break;
      }
    }
    for(let i=0;i<this.eventsListSearch.length;i++)
    {
      if(this.eventsListSearch[i]._id===event._id)
      {
        this.eventsListSearch[i]=event;
        break;
      }
    }

    this.fillUsersEvents(event.organizator._id);
    this.setPaginatorList(0);
    this.setPaginatorUsersEvents(0);
  }

  deleteEventInClient(event: EventASG)
  {
    for(let i=0;i<this.eventsList.length;i++)
    {
      if(this.eventsList[i]._id===event._id)
      {
        this.eventsList.splice(i,1);
        break;
      }
    }
    for(let i=0;i<this.eventsListSearch.length;i++)
    {
      if(this.eventsListSearch[i]._id===event._id)
      {
        this.eventsListSearch.splice(i,1);
        break;
      }
    }
    this.fillUsersEvents(event.organizator._id);
    this.setPaginatorList(0);
    this.setPaginatorUsersEvents(0);
  }


  public setPaginatorUsersEvents(index: number)
  {
    this.userEventsPaginator=[];
    if ((index + 1) * 10 > this.userEvents.length)
    {
      for (let i = index * 10; i < this.userEvents.length; i++)
      {
        this.userEventsPaginator.push(this.userEvents[i]);
      }
    }
    else{
      for (let i = index * 10; i < (index + 1) * 10; i++)
      {
        this.userEventsPaginator.push(this.userEvents[i]);
      }
    }
  }

public updateUserPaymentInClient(_ev:string, paymentStatus: boolean, userID:string)
{
  for(let ev of this.eventsList){
    if (ev._id=== _ev)
    {
      for(let fraction of ev.frakcje)
        {
            fraction.zapisani.forEach((item,index)=>{
              
              if(item._id=== userID)
              {
                item.czy_oplacone = paymentStatus;
                return
              } 
            })
        }
    }
  }
}

public  updateUserPayment(_ev:string, paymentStatus: boolean, userID:string, frakcja: string):Observable<any>
{
  const options = {_id:_ev, strona:frakcja, _idGracz:userID, czy_oplacone: paymentStatus}
  return this.http.put(this.url+'/api/updateUserPayment', {params: options}).pipe(catchError(this.handleError));
}

public socketEmitUpdatePayment(_ev:string, paymentStatus: boolean, userID:string, frakcja: string)
{
  const options = {_id:_ev, strona:frakcja, _idGracz:userID, czy_oplacone: paymentStatus}
  this.socket.emit('updatePayments',options);
}

public socketOnUpdatePayment():Observable<any>
{
  return this.socket.fromEvent('updatePayments').pipe(catchError(this.handleError));
} 

}




