import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from "@angular/material/dialog";
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './my-site/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MySiteComponent } from './my-site/my-site.component';
import { MyWorkComponent } from './my-work/my-work.component';
import { HomeComponent, SiteDialogComponent } from './home/home.component';
import { EventMapComponent } from './my-work/event-map/event-map.component';
import { NavBarComponent } from './my-work/nav-bar/nav-bar.component';
import {  EquipmentComponent } from './my-work/equipment/equipment.component';
import { LocationsListComponent } from './my-work/locations-list/locations-list.component';
import { LoginComponent } from './my-work/login/login.component';
import { LoginService } from './my-work/services/login.service';
import { CookieService } from 'ngx-cookie-service';
import { GoogleMapsModule } from '@angular/google-maps';
import { EventFormComponent } from './my-work/event-form/event-form.component';
import {EventServiceService} from './my-work/services/event-service.service';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EventEditorComponent } from './my-work/event-editor/event-editor.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatRippleModule} from '@angular/material/core';
import { deleteDialogComponent } from './my-work/Snackbars/DeleteDialog';
import {SocketIoModule, SocketIoConfig} from 'ngx-socket-io';
import { PaymentResultComponent } from './my-work/payment-result/payment-result.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { TokenResolveComponent } from './my-work/token-resolve/token-resolve.component';
const config: SocketIoConfig = {url: 'http://localhost:3010', options:{}}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MySiteComponent,
    MyWorkComponent,
    SiteDialogComponent,
    HomeComponent,
    EventMapComponent,
    NavBarComponent,
    EquipmentComponent,
    LocationsListComponent,
    LoginComponent,
    EventFormComponent,
    EventEditorComponent,
    deleteDialogComponent,
    PaymentResultComponent,
    TokenResolveComponent



  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatTabsModule,
    HttpClientModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatPaginatorModule,
    MatCardModule,
    MatGridListModule,
    MatSnackBarModule,
    MatStepperModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSidenavModule,
    MatRippleModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    SocketIoModule.forRoot(config)
  ],
  exports:[ReactiveFormsModule, FormsModule, CommonModule],
  providers: [LoginService, CookieService, EventServiceService],
  bootstrap: [AppComponent]
})
export class AppModule {}
