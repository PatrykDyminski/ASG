import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
import { Observable } from 'rxjs';
import { ThemeService } from './theme.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(public themeS: ThemeService){}

  ngOnInit(){

  }

}



