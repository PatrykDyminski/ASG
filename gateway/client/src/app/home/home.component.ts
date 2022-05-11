import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router"
import {MatDialog, MatDialogRef} from '@angular/material/dialog'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

   constructor(public dialog:MatDialog) {}
  ngOnInit() { this.openDialog();}

  openDialog(): void {
    const dialogRef=this.dialog.open(SiteDialogComponent, {
  height: '400px',
  width: '600px',
});
    dialogRef.afterClosed().subscribe(result => {
     console.log(`Dialog result: ${result}`);
   });
  }
  title = 'client';

}
@Component({
  selector: 'app-site-dialog',
  templateUrl:'./dialog.component.html'
})

export class SiteDialogComponent implements OnInit{
  constructor(public dialogRef:MatDialogRef<SiteDialogComponent>, public route:Router) {}
   mysitetext:string = 'Strona twórcy';
   myworktext:string = 'Praca inżynierska';
   ngOnInit()
   {
    this.route.navigate(['/myWork']);
   };
mySite(){
  console.log('mySite');
  this.dialogRef.close();
  this.route.navigate(['/mySite']);
}
myWork(){
  console.log('myWork');
  this.dialogRef.close();
   this.route.navigate(['/myWork']);
}
}
