import { Component, OnInit, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { LoginService } from '../services/login.service';
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
import Toggle from 'ol-ext/control/toggle'
import OverlayMenu from 'ol-ext/control/Overlay'
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
import { Player } from '../services/player';
import { MatSnackBar } from '@angular/material/snack-bar';
import {loginSnackBarComponent} from '../Snackbars/loginSnackBar';
import { first } from 'rxjs/operators';
import { LocationsService } from '../services/locations.service';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Location} from '../services/location';


@Component({
  selector: 'app-locations-list',
  templateUrl: './locations-list.component.html',
  styleUrls: ['./locations-list.component.scss']
})
export class LocationsListComponent implements OnInit {

  constructor(private route: ActivatedRoute, private loginS: LoginService, private locationS: LocationsService,
     @Inject(DOCUMENT) document, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.locationS.getFields().pipe(first()).subscribe(fields =>{
      this.locationS.fieldsList=fields;
      this.addFeatures();
    });


   }
  coord;
  map;
  menu;
  marker: Feature;
  vectorSource;
  vectorLayer;
  listenerKey;
  select;
  feature;
  content;
  popup;
  clusterSource;
  locationsToDisplay;
  wsp='';
  locationForm : FormGroup;
  ngOnInit(): void {
    this.initMap();
    this.locationForm=this.fb.group({
      nazwa:['', Validators.required],
      adres: [ '', Validators.required],
      wspe: ['', Validators.required],
      opis:['',Validators.required]
    })
  }


  initMap(): void
  {
    FontStyle.addDefs(
      {	"font": "FontAwesome",
        "name": "FontAwesome",
        "copyright": "SIL OFL 1.1",
        "prefix": "fa"
      }, {"fas fa-warning": "\uf071", "fas fa-crosshair": "\uf05b", "fas fa-fire":"\uf06d", "fas fa-flag":"\uf041", "fa-plus-circle":"\uf055" });
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
      target: 'map_loc',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([19.423611, 52.114167]),
        zoom: 6.7
      }),
      overlays: [this.popup]
    });
    // Overlay
	    this.menu = new OverlayMenu ({
		closeBox : true,
		className: 'slide-left mymenu',
		content: document.getElementById('menu')
	});
	   this.map.addControl(this.menu);

	// A toggle control to show/hide the menu
	   var t = new Toggle(
			{	html: document.getElementById('addicon'),
				className: 'toggle',
        title: 'Dodaj lokacje',
        onToggle: () => this.showMenu()
      });

      console.log(t.getButtonElement().contorl);
    this.map.addControl(t);

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
              fontSize: 0.9,
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
        this.locationsToDisplay=this.locationS.fieldsList.find(x=>x._id==this.feature.get('id'));
        this.content = '<div class="ol-popup" style="min-width:250px;"> <h2> ';
        this.content += this.feature.get('nazwa')+ '</h2><hr><h3> Adres: ' +this.feature.get('adres') + '</h3><hr><h4>' + this.feature.get('opis')  + '</h4></div>';
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
      //let cor = olProj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      //console.log(evt.coordinate);
      this.wsp = evt.coordinate;
      let feature = new Feature(new Point(evt.coordinate));
      feature.set('i', 5);
      //console.log(evt.coordinates);
      let coor =olProj.transform(this.wsp, 'EPSG:3857', 'EPSG:4326');
      var coorDigital=[];
      coorDigital[0]=Number(coor[0]).toFixed(2);
      coorDigital[1]=Number(coor[1]).toFixed(2);
      this.locationForm.patchValue({wspe:coorDigital});

      this.vectorSource.clear();
      this.vectorSource.addFeature(feature)}} );
      //Sthis.addFeatures();
  }

  addFeatures(){
    var ext = this.map.getView().calculateExtent(this.map.getSize());
    var features = [];
    for (let ev of this.locationS.fieldsList){
      var coorString:string[]=ev.wsp.split(',');
      var coor=[];
      coor[0]=Number(coorString[0]);
      coor[1]=Number(coorString[1]);
      var feature = new Feature(new Point(coor));
      feature.set('nazwa', ev.nazwa);
     feature.set('adres',ev.adres);
     feature.set('opis', ev.opis);
      features.push(feature)
    }
    this.clusterSource.getSource().clear();
    this.clusterSource.getSource().addFeatures(features);

  }
  refreshFeatures()
  {
   var ext = this.map.getView().calculateExtent(this.map.getSize());
   var features = [];
   for (let ev of this.locationS.fieldsList){
     var coorString:string[]=ev.wsp.split(',');
     var coor=[];
     coor[0]=Number(coorString[0]);
     coor[1]=Number(coorString[1]);
     var feature = new Feature(new Point(coor));
     feature.set('nazwa', ev.nazwa);
     feature.set('adres',ev.adres);
     feature.set('opis', ev.opis);
     features.push(feature)
    }
   this.clusterSource.getSource().clear();
   this.clusterSource.getSource().addFeatures(features);
  }

  submit()
  {
    this.locationForm.markAllAsTouched();
    if(this.locationForm.valid===true)
    {
      var newLocation: Location=
      {
        _id: '',
        nazwa: this.locationForm.value.nazwa,
        adres: this.locationForm.value.adres,
        wsp: String(this.wsp),
        opis: this.locationForm.value.opis
      };

      this.locationS.postField(newLocation).pipe(first()).subscribe(data=> {
        newLocation._id=data.created_id;
        this.locationS.fieldsList.push(newLocation);
        this.locationForm.reset();
        this.locationForm.markAsPristine();
        //snackBar
        this.refreshFeatures();
      })
    }
  }
  showMenu() {
    if(this.loginS.logged===true)
    this.menu.toggle();
    else
    this.snackBar.openFromComponent(loginSnackBarComponent,{ duration: 5000,
      horizontalPosition: "center", verticalPosition: "top"});
  }
}
