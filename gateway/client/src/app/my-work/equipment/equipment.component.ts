import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Accesory } from '../services/accesory';
import { EquipmentService } from '../services/equipment.service';
import { Item } from '../services/item';
import { LoginService } from '../services/login.service';
import { Weapon } from '../services/weapon';
import { addedItemSnackBarComponent } from '../Snackbars/addedItem';
import { deleteDialogComponent } from '../Snackbars/DeleteDialog';
import { deletedItemSnackBarComponent } from '../Snackbars/DeletedItem';
import { updatedItemSnackBarComponent } from '../Snackbars/updatedItem';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit, AfterViewInit {
  weaponForm: FormGroup;
  itemForm: FormGroup;
  accesoryForm: FormGroup;
  showNewW:boolean = null;
  showNewI:boolean = null;
  showNewA:boolean = null;
  selectedWeapon: Weapon;
  selectedItem: Item;
  selectedAccesory: Accesory;
  @ViewChild('weapon', {static: false}) inputEl:ElementRef;

  constructor(private dialog: MatDialog, private loginS: LoginService, public eqS: EquipmentService, private fb: FormBuilder, private route: ActivatedRoute, private snackbar: MatSnackBar ) {

   }
  ngAfterViewInit(): void {
   setTimeout(() =>{ if(this.loginS.logged===true){

      console.log(this.loginS.user);
      this.eqS.getWeapons(this.loginS.user.userID).pipe(first()).subscribe(weapons=>{
        this.eqS.weaponsList=weapons;
    });
      this.eqS.getItems(this.loginS.user.userID).pipe(first()).subscribe(items=>{
      this.eqS.itemsList = items;
    });

      this.eqS.getAccesories(this.loginS.user.userID).pipe(first()).subscribe(accesories=>{
      this.eqS.accesoriesList = accesories;
    });
  }
  },
   100);
  }

  ngOnInit(): void {
    this.weaponForm = this.fb.group({
      nazwa: ['', Validators.required],
      rodzaj:['', Validators.required],
      fps:['', Validators.required],
      rof: '',
      skuteczny:'',
      opis:''
    });
    this.itemForm= this.fb.group({
      nazwa: ['', Validators.required],
      kamo:'',
      rodzaj: ['', Validators.required],
      opis:'',
    });
    this.accesoryForm=this.fb.group({
      nazwa: ['', Validators.required],
      rodzaj: ['', Validators.required],
      opis: ''
    });
  }
  addWeapon(){
    this.setAllNull()
    this.showNewW=true;
    setTimeout(() => this.inputEl.nativeElement.focus(), 30);
  }
  addItem(){
    this.setAllNull()
    this.showNewI=true;
  }
  addAccesory(){
    this.setAllNull()
    this.showNewA=true;
  }

  submitNewWeapon(){
    if(this.weaponForm.valid===true){
     let newWeapon: Weapon = {
        _id:'',
        owner:  this.loginS.user.userID,
        nazwa: this.weaponForm.value.nazwa,
        rodzaj: this.weaponForm.value.rodzaj,
        fps: this.weaponForm.value.fps,
        rof: this.weaponForm.value.rof,
        skuteczny: this.weaponForm.value.skuteczny,
        opis: this.weaponForm.value.opis
      };
     console.log(newWeapon);
     this.eqS.postWeapon(newWeapon).pipe(first()).subscribe(data =>{
          newWeapon._id=data.created_id;
          this.eqS.weaponsList.push(newWeapon);
          console.log(data.message);
          this.weaponForm.reset();
          this.weaponForm.markAsPristine();
          this.showNewW=null;
          this.snackbar.openFromComponent(addedItemSnackBarComponent, { duration: 5000,
            horizontalPosition: "center", verticalPosition: "top"});
          }, error =>{
            alert(error);
          }
        );

    }
    else{
      alert("Sprawdź poprawność formularza.");
    }
  }
  submitNewItem(){ if(this.itemForm.valid===true){
    let newItem: Item = {
       _id:'',
       owner:  this.loginS.user.userID,
       nazwa: this.itemForm.value.nazwa,
       kamo: this.itemForm.value.kamo,
       rodzaj: this.itemForm.value.rodzaj,
       opis: this.itemForm.value.opis
     };
    console.log(newItem);
    this.eqS.postItem(newItem).pipe(first()).subscribe(data =>{
         newItem._id=data.created_id;
         this.eqS.itemsList.push(newItem);
         console.log(data.message);
         this.itemForm.reset();
         this.itemForm.markAsPristine();
         this.showNewI=null;
         this.snackbar.openFromComponent(addedItemSnackBarComponent, { duration: 5000,
          horizontalPosition: "center", verticalPosition: "top"});
         }, error =>{
           alert(error);
         }
       );

   }
   else{
     alert("Sprawdź poprawność formularza.");
   }}


  submitNewAccesory(){ if(this.accesoryForm.valid===true){
    let newAccesory: Accesory = {
      _id:'',
      owner:  this.loginS.user.userID,
      nazwa: this.accesoryForm.value.nazwa,
      rodzaj: this.accesoryForm.value.rodzaj,
      opis: this.accesoryForm.value.opis
    };
    console.log(newAccesory);
    this.eqS.postAccesory(newAccesory).pipe(first()).subscribe(data =>{
        newAccesory._id=data.created_id;
        this.eqS.accesoriesList.push(newAccesory);
        //console.log(data.message);
        this.accesoryForm.reset();
        this.accesoryForm.markAsPristine();
        this.showNewA=null;
        this.snackbar.openFromComponent(addedItemSnackBarComponent, { duration: 5000,
          horizontalPosition: "center", verticalPosition: "top"});
        }, error =>{
          alert(error);
        }
      )
  }
      else{
        alert("Sprawdź poprawność formularza.");
      }
  };


  submitExistingWeapon(){
    if(this.weaponForm.valid===true &&this.selectedWeapon!==null){
     let newWeapon: Weapon = {
        _id:this.selectedWeapon._id,
        owner:  this.loginS.user.userID,
        nazwa: this.weaponForm.value.nazwa,
        rodzaj: this.weaponForm.value.rodzaj,
        fps: this.weaponForm.value.fps,
        rof: this.weaponForm.value.rof,
        skuteczny: this.weaponForm.value.skuteczny,
        opis: this.weaponForm.value.opis
      };
     //console.log(newWeapon);
     this.eqS.putWeapon(newWeapon).pipe(first()).subscribe(data =>{
          //this.eqS.weaponsList.push(newWeapon);
          this.eqS.updateWeapon(newWeapon);
          console.log(data.message);
          this.weaponForm.reset();
          this.showNewW=null;
          this.selectedWeapon=null;
          this.showNewW=null;
          this.weaponForm.markAsPristine();
          this.snackbar.openFromComponent(updatedItemSnackBarComponent, { duration: 5000,
            horizontalPosition: "center", verticalPosition: "top"});
          }, error =>{
            alert(error);
          }
        );

    }
    else{
      alert("Sprawdź poprawność formularza.");
    }
  };

  submitExistingItem(){ if(this.itemForm.valid===true){
    let newItem: Item = {
       _id:this.selectedItem._id,
       owner:  this.loginS.user.userID,
       nazwa: this.itemForm.value.nazwa,
       kamo: this.itemForm.value.kamo,
       rodzaj: this.itemForm.value.rodzaj,
       opis: this.itemForm.value.opis
     };
    //console.log(newItem);
    this.eqS.putItem(newItem).pipe(first()).subscribe(data =>{

         this.eqS.updateItem(newItem);
         console.log(data.message);
         this.itemForm.reset();
         this.selectedItem=null;
         this.showNewA=null;
        this.itemForm.markAsPristine();
        this.snackbar.openFromComponent(updatedItemSnackBarComponent, { duration: 5000,
          horizontalPosition: "center", verticalPosition: "top"});
         }, error =>{
           alert(error);
         }
       );

   }
   else{
     alert("Sprawdź poprawność formularza.");
   }}


   submitExistingAccesory(){ if(this.accesoryForm.valid===true){
    let newAccesory: Accesory = {
      _id:this.selectedAccesory._id,
      owner:  this.loginS.user.userID,
      nazwa: this.accesoryForm.value.nazwa,
      rodzaj: this.accesoryForm.value.rodzaj,
      opis: this.accesoryForm.value.opis
    };
    console.log(newAccesory);
    this.eqS.putAccesory(newAccesory).pipe(first()).subscribe(data =>{
       this.eqS.updateAccesory(newAccesory);
      // console.log(data.message);
       this.accesoryForm.reset();
       this.showNewA=null;
       this.selectedAccesory=null;
       this.accesoryForm.markAsPristine();
       this.snackbar.openFromComponent(updatedItemSnackBarComponent, { duration: 5000,
        horizontalPosition: "center", verticalPosition: "top"});
        }, error =>{
          alert(error);
        }
      )
  }
      else{
        alert("Sprawdź poprawność formularza.");
      }
  };

  showExistingWeapon(i: number)
  {
    this.setAllNull();
    this.selectedWeapon=this.eqS.weaponsList[i];
    this.weaponForm.patchValue({
    nazwa: this.selectedWeapon.nazwa,
    rodzaj: this.selectedWeapon.rodzaj,
    fps: this.selectedWeapon.fps,
    rof: this.selectedWeapon.rof,
    skuteczny: this.selectedWeapon.skuteczny,
    opis: this.selectedWeapon.opis
   });
    this.showNewW=false;
  }
  showExistingItem(i:number)
  {
    this.setAllNull();
    this.selectedItem=this.eqS.itemsList[i];
    this.itemForm.patchValue({
      nazwa: this.selectedItem.nazwa,
       kamo: this.selectedItem.kamo,
       rodzaj: this.selectedItem.rodzaj,
       opis: this.selectedItem.opis
    })
    this.showNewI=false;
  }
  showExistingAccesory(i: number){
    this.setAllNull();
    this.selectedAccesory=this.eqS.accesoriesList[i];
    this.accesoryForm.patchValue({
      nazwa: this.selectedAccesory.nazwa,
      rodzaj: this.selectedAccesory.rodzaj,
      opis: this.selectedAccesory.opis
    });
    this.showNewA=false;
  }
 deleteWeapon(i:number)
  {
    const dialogRef = this.dialog.open(deleteDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result===true){
    this.eqS.deleteWeapon(this.eqS.weaponsList[i]._id).pipe(first()).subscribe(data =>{
      //console.log(data.message);
      this.eqS.weaponsList.splice(i,1);
      this.snackbar.openFromComponent(deletedItemSnackBarComponent, { duration: 5000,
        horizontalPosition: "center", verticalPosition: "top"});
    },
    error =>{
      console.log(error);
    })
  }
})

}
  deleteItem(i:number)
  {
    const dialogRef = this.dialog.open(deleteDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result===true){
        this.eqS.deleteItem(this.eqS.itemsList[i]._id).pipe(first()).subscribe(data =>{
          console.log(data.message);
          this.eqS.itemsList.splice(i,1);
          this.snackbar.openFromComponent(deletedItemSnackBarComponent, { duration: 5000,
            horizontalPosition: "center", verticalPosition: "top"});
        }, error =>{
          console.log(error);
        });
      }
    })

  }

  deleteAccesory(i:number)
  {
    const dialogRef = this.dialog.open(deleteDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result===true){
    this.eqS.deleteAccesory(this.eqS.accesoriesList[i]._id).pipe(first()).subscribe(data =>{
      console.log(data.message);
      this.eqS.accesoriesList.splice(i,1);
      this.snackbar.openFromComponent(deletedItemSnackBarComponent, { duration: 5000,
        horizontalPosition: "center", verticalPosition: "top"});
    }, error =>{
      console.log(error);
    })
    }
  })
  }


  setAllNull()
  {
    this.showNewW=null;
    this.showNewI=null;
    this.showNewA=null;
    this.selectedAccesory=null;
    this.selectedItem=null;
    this.selectedWeapon=null;
    this.weaponForm.reset();
    this.weaponForm.markAsPristine();
    this.itemForm.reset();
    this.itemForm.markAsPristine();
    this.accesoryForm.reset();
    this.accesoryForm.markAsPristine();
  }
}


