import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import{Location} from './location';
@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  fieldsList: Location[]=[];
  constructor(private http: HttpClient) { }

  getFields()
  {
    return this.http.get<Location[]>('http://localhost:3000/api/getFields').pipe(catchError(this.handleError));
  }

  postField(field:Location):Observable<any>{
    return this.http.post('http://localhost:3000/api/postField', field).pipe(catchError(this.handleError));
  }


  public handleError(er: HttpErrorResponse){
    return throwError('Something went wrong, try again');
  }
}
