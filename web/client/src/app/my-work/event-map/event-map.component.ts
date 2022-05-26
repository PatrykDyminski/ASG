import { Component, OnInit, ViewChild } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorSource from 'ol/source/Vector';
import ClusterSource from 'ol/source/Cluster';
import VectorLayer from 'ol/layer/Vector';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import XyzSource from 'ol/source/XYZ';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import OSM from 'ol/source/OSM';
import FontStyle from 'ol-ext/style/FontSymbol';
import Observable from 'ol/Observable';
import Overlay from 'ol/Overlay';
import Popup from 'ol-ext/Overlay/Popup';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import olExt from 'ol-ext';
import Select from 'ol/interaction/Select';
import * as extent from 'ol/extent';
import SelectCluster from 'ol-ext/interaction/SelectCluster';
import {fromLonLat} from 'ol/proj';
import {EventServiceService} from '../services/event-service.service';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {EventASG} from '../services/event';
import { LoginService } from '../services/login.service';
import { Player } from '../services/player';
import { MatSnackBar } from '@angular/material/snack-bar';
import {loginSnackBarComponent} from '../Snackbars/loginSnackBar';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { deleteDialogComponent } from '../Snackbars/DeleteDialog';
import {MatDialogModule} from '@angular/material/dialog';
import { deletedEventSnackBarComponent } from '../Snackbars/DeletedEvent';
import { TouchSequence } from 'selenium-webdriver';
@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.scss']
})
export class EventMapComponent implements OnInit {
   map;
   marker: Feature;
   vectorSource;
   vectorLayer;
   listenerKey;
   select;
   feature;
   content;
   popup;
   clusterSource;
   glyph = 'danger';
   pageEvent: PageEvent;
   selectedEvent: EventASG[] = [];
   eventToDisplay: EventASG = null;
   enlistedFraction = '';
   response= {message: ''};
    selectedTab = 0;
    wsp = '';
    replicas = ["Karabiny snajperskie", "Karabiny wyborowe", "Karabiny wsparcia", "Karabiny szturmowe", "Bliski dystans"]

  constructor(public eventS: EventServiceService, public loginS: LoginService, private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.eventS.getEvents().pipe(first()).subscribe(events => {
      this.eventS.eventsList = events;
      this.eventS.eventsListSearch = events;
      this.eventS.setPaginatorList(0);
      if(this.loginS.logged===true)
      {
        this.eventS.fillUsersEvents(this.loginS.user.userID);
        this.eventS.setPaginatorUsersEvents(0);
      }
      this.addFeatures();
    });

    this.eventS.socketOnGetEvents().pipe().subscribe(data => {
      console.log(data);
    })
    this.eventS.socketEmitGetEvents()
  }

public checkIfShouldDisplay()
{
  //this.loginS.logged===false ||
  if(this.eventToDisplay==null || this.selectedTab==2)
  return false;
  else
  return true;

}

public changedTabHandler(event)
{
  //console.log(event);
  //this.selectedTab=event;
  this.eventS.eventToEdit=null;
  this.eventToDisplay=null;
}

public disabledButton()
{
  for(let frakcja of this.eventToDisplay.frakcje )
  {
      for(const player of frakcja.zapisani)
      {
        if(player._id===this.loginS.user.userID)
        {
          this.enlistedFraction = frakcja.strona;
          return false;
        }
      }
    }
  return true;
}

  public joinToEvent(event:string, name:string)
  {
    let paymenet_done = false;
    if(this.loginS.logged===true){


      /// logika opłaty za wydarzenie
      this.paymentLogic();

      //jeżeli opłata się powiodła, przypisać odpowiednią wartość do payment_done
    this.eventS.joinFraction(event,name,this.loginS.user.userID, this.loginS.user.name, paymenet_done).subscribe(data=>{
      this.response=data ;
      console.log(this.response.message);
      this.eventS.addPlayerInClient(event,name,this.loginS.user.userID,this.loginS.user.name, paymenet_done); // false- default dla czy_oplacone
      this.eventToDisplay=this.eventS.eventsList.find((item)=> (item._id===event));
    }, e =>{
      this.response=e;
      alert(this.response.message);
    });
    //skopiować z wyżej logikę
    this.eventS.socketOnJoinFraction().pipe(first()).subscribe(data => {
      this.response=data;
      console.log(data);
    })
    this.eventS.socketEmitJoinFraction(event,name,this.loginS.user.userID, this.loginS.user.name, paymenet_done);
    
  }
  else{
    this.snackBar.openFromComponent(loginSnackBarComponent, { duration: 5000,
      horizontalPosition: "center", verticalPosition: "top"});
  }
  }


public unsignFromEvent(event:string)
{
  this.eventS.socketOnLeaveFraction().pipe(first()).subscribe(data => {
    console.log(data);
  });
  this.eventS.socketEmitLeaveFraction(event,this.loginS.user.userID);
  this.eventS.leaveFraction(event,this.loginS.user.userID).subscribe(data=>{
    this.response=data;
    alert(this.response.message);
    this.eventS.deletePlayerInClient(event,this.enlistedFraction,this.loginS.user.userID);
    this.eventToDisplay=this.eventS.eventsList.find((item)=> (item._id===event));
},e=>{ this.response=e;
  alert(this.response.message);} );
}

  public countPlayers()
  {
    let count=0;
    for (let fraction of this.eventToDisplay.frakcje)
    {
      count+=fraction.zapisani.length;
  }
    return count;
  }
  public countPlayersEv(ev: EventASG)
  {
    let count=0;
    for (let fraction of ev.frakcje)
    {
      count+=fraction.zapisani.length;
  }
    return count;
  }
  public changePage(event?: PageEvent)
  {
    this.eventS.setPaginatorList(event.pageIndex);
  }
  onNgModelChange(event)
  {
    this.eventS.eventToEdit=null;
    this.selectedEvent = event;
    if (this.selectedEvent.length > 0){
     // if(this.loginS.logged===true){
    this.eventToDisplay = this.selectedEvent[0];
    var coorString:string[]=this.eventToDisplay.wsp.split(',');
      var coor=[];
      coor[0]=Number(coorString[0]);
      coor[1]=Number(coorString[1]);
      this.map.getView().setCenter(coor);
      this.map.getView().setZoom(10);
    //  }
    //  else{
     //  this.snackBar.openFromComponent(loginSnackBarComponent, { duration: 5000,
     //   horizontalPosition: "center", verticalPosition: "top"})
     // }
    }
  }
  public SoldiersCount(ev: EventASG)
  {
    let x = 0;
    for (let frakcja in ev.frakcje)
    {
      x += frakcja.length;
    }
    return x;
  }
  ngOnInit(): void {
  this.initMap();
  this.clusterSource.changed();
  }

  initMap(): void
  {
    FontStyle.addDefs(
      {	"font": "FontAwesome",
        "name": "FontAwesome",
        "copyright": "SIL OFL 1.1",
        "prefix": "fa"
      }, {"fas fa-warning": "\uf071", "fas fa-crosshair": "\uf05b", "fas fa-fire":"\uf06d", "fas fa-flag":"\uf024" });
    this.popup = new Popup ({
      popupClass: "default anim", // "tooltips", "warning" "black" "default", "tips", "shadow",
      closeBox: true,
      onshow: function(){console.log('you opened the box'); },
      onclose: function(){ console.log('You close the box'); },
      positioning: 'bottom-auto',
      autoPan: true,
      autoPanAnimation: { duration: 250 }
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([19.423611, 52.114167]),
        zoom: 5
      }),
      overlays: [this.popup]
    });

    var styleCache = {};
    function getStyle(feature, resolution){
      var size = feature.get('features').length;
      var style = styleCache[size];
      if (!style) {
        var color = size > 4 ? '192,0,0' : size > 2 ? "255,128,0" : "0,128,0";
        var radius = Math.max(8, Math.min(size * 0.75, 20));
        var dash = 2 * Math.PI * radius / 6;
        var dash2 = [ 0, dash, dash, dash, dash, dash, dash ];
        style = styleCache[size] = size == 1 ? new Style({
          image: new FontStyle({
              form: 'none', //"hexagone",
              gradient: false,
              glyph: 'fas fa-flag',
              fontSize: 0.65,
              fontStyle: '',
              radius: 17,
              //offsetX: -15,
              rotation: 0,
              rotateWithView: true,
              offsetY: 0 ,
              color: 'blue',
              fill: new Fill({
                color: 'blue'})
        })//tutaj stroke etc, po przecinku
       }) : new Style({
          image: new Circle({
            radius: radius,
            stroke: new Stroke({
              color: "rgba(" + color + ",0.5)",
              width: 15 ,
              lineDash: dash2,
              lineCap: "butt"
            }),
            fill: new Fill({
              color: "rgba(" + color + ",1)"
            })
          }),
          text: new Text({
            text: size.toString(),
            // font: 'bold 12px comic sans ms',
            // textBaseline: 'top',
            fill: new Fill({
              color: '#fff'
            })
          })
        });
      }
      return style;
    }

    // Cluster Source
    this.clusterSource = new ClusterSource({
      distance: 20,
      source: new VectorSource()
    });
    // Animated cluster layer
    var clusterLayer = new AnimatedCluster({
      name: 'Cluster',
      source: this.clusterSource,
      animationDuration:  700,
      // Cluster style
      style: getStyle
    });
    this.vectorSource = new VectorSource({});
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new FontStyle({
            form: 'none', //"hexagone",
            gradient: false,
            glyph: 'fas fa-crosshair', //car[Math.floor(Math.random()*car.length)],
            fontSize: 0.65,
            fontStyle: '',
            radius: 17,
            //offsetX: -15,
            rotation: 0,
            rotateWithView: true,
            offsetY: 0 ,
            color: 'blue',
            fill: new Fill({
              color: 'blue'})
      })//tutaj stroke etc, po przecinku
     })
    })

    this.map.addLayer(clusterLayer);
    this.map.addLayer(this.vectorLayer);




    this.select = new Select({layers: [clusterLayer]});
    this.map.addInteraction(this.select);

// bez clustera, do popupów
    this.select.getFeatures().on(['add'], (e) => {
       var c = e.element.get('features');
       this.feature = c[0];
       if (c.length === 1){
        this.eventToDisplay=this.eventS.eventsList.find(x=>x._id==this.feature.get('id'));
        this.selectedEvent=[];
        this.content = '<div class="ol-popup" style="min-width: 150px"> <h2> ';
        this.content += this.feature.get('nazwa') + '</h2><hr><h3>'+ this.getMeDate(this.feature.get('data')) + '</div>';
        this.popup.show(this.feature.getGeometry().getCoordinates(), this.content);
       }
       else{
         const extents = new extent.createEmpty();
         c.forEach((f) => {
          extent.extend(extents, f.getGeometry().getExtent());
      });
         //zoom to the extent
         this.map.getView().fit(extents);
         this.map.getView().setZoom(this.map.getView().getZoom() - 1);
       }
    });
    this.select.getFeatures().on(['remove'], (e) => {
      this.popup.hide();
    });
    this.map.on('singleclick', (evt) => {
      const feat = this.map.forEachFeatureAtPixel(
        evt.pixel,
        function(someFeature){ return someFeature; } // stop at the very first feature
      );
      if (feat == null){
      let cor = olProj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      //console.log(cor);
      //console.log(evt.coordinate);
      //console.log(evt.coordinate);
      this.wsp = evt.coordinate;
      let feature = new Feature(new Point(evt.coordinate));
      //console.log(evt.coordinates);
      this.vectorSource.clear();
      this.vectorSource.addFeature(feature)}} );
      //Sthis.addFeatures();
  }


addFeatures(){
    var ext = this.map.getView().calculateExtent(this.map.getSize());
    var features = [];
    for (let ev of this.eventS.eventsList){
      var coorString:string[]=ev.wsp.split(',');
      var coor=[];
      coor[0]=Number(coorString[0]);
      coor[1]=Number(coorString[1]);
      var feature = new Feature(new Point(coor));
      feature.set('nazwa', ev.nazwa);
      feature.set('data', ev.termin);
      features.push(feature)
    }
    this.clusterSource.getSource().clear();
    //console.log('here');
    this.clusterSource.getSource().addFeatures(features);

  }
refreshFeatures()
{
  var ext = this.map.getView().calculateExtent(this.map.getSize());
  var features = [];
  for (let ev of this.eventS.eventsList){
    var coorString:string[]=ev.wsp.split(',');
    var coor=[];
    coor[0]=Number(coorString[0]);
    coor[1]=Number(coorString[1]);
    var feature = new Feature(new Point(coor));
    feature.set('nazwa', ev.nazwa);
    feature.set('data', ev.termin);
    features.push(feature)
  }
  this.clusterSource.getSource().clear();
  //console.log('here refresh');
  this.clusterSource.getSource().addFeatures(features);
}

public setToEdit(ev)
{
  this.eventToDisplay = null;
  this.eventS.eventToEdit = ev;
  console.log(this.eventS.eventToEdit);
}



getMeDate(date: string)
{
  let date_to_show= new Date(date);
  let options ={weekday: "long", year:"numeric", month:"long", day: "numeric" };
  return date_to_show.toLocaleString('pl-PL');
}
deleteEvent(ev: EventASG)
{

    const dialogRef = this.dialog.open(deleteDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result===true){
        this.eventS.socketOnDeleteEvent().pipe(first()).subscribe(data => {
          console.log(data);
        });
        this.eventS.socketEmitDeleteEvent(ev);
    this.eventS.deleteEvent(ev).pipe(first()).subscribe(data => {
     this.snackBar.openFromComponent(deletedEventSnackBarComponent, { duration: 5000,
      horizontalPosition: "center", verticalPosition: "top"});
      this.eventS.deleteEventInClient(ev);
      window.location.reload();
      });
  
    }
  })
}

checkIfPayed(_ev:string)
{
  let _czy_oplacone;
  for(let ev of this.eventS.eventsList){
    if (ev._id=== _ev)
    {
      for(let fraction of ev.frakcje)
        {
            fraction.zapisani.forEach((item,index)=>{
              
              if(item._id=== this.loginS.user.userID)
              {
                _czy_oplacone = item.czy_oplacone;
                return;
                
                
              } 
            })
        }
    }
  }
  return _czy_oplacone;
}
  userEventToShow(i: number)
{
  this.eventToDisplay=this.eventS.userEventsPaginator[i];
  var coorString:string[]=this.eventToDisplay.wsp.split(',');
      var coor=[];
      coor[0]=Number(coorString[0]);
      coor[1]=Number(coorString[1]);
      this.map.getView().setCenter(coor);
      this.map.getView().setZoom(10);
}
paymentLogic()
{

  
}

 payForEvent(eventId: string, )
{
  this.paymentLogic();
  //web socket jeżeli potrzebny, tak samo, tylko inną metodę wywołać.
  this.eventS.updateUserPayment(eventId,true,this.loginS.user.userID, this.enlistedFraction).subscribe(data =>
    {
      this.response=data ;
      console.log(this.response.message);
      this.eventS.updateUserPaymentInClient(eventId, true,this.loginS.user.userID);
      
    }, e => {
      console.log("error");
        this.response=e;
        alert(this.response.message)
    });

 
};




}
