import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {CookieService} from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  error=false;
  user={ userID:'', name:'',photo:'', mail:''};
  logged=false;
  url='http://localhost:3002';
  constructor(private http: HttpClient) {

   }

  public Login(token: String): Observable<any>{

    const header = new HttpHeaders().set( 'Authorization', 'Bearer ' + token);
    var x = this.http.get(this.url+'/api/user', {headers: header, observe: 'response'}).pipe(catchError(this.loginError));

    return x;
  }

  public setNullJWT()
  {

  }

  private loginError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.

      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Expired token');
  }
}
