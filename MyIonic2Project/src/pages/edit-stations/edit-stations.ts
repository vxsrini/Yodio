import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Component, NgZone } from '@angular/core';

@IonicPage()
@Component({
  selector: 'page-edit-stations',
  templateUrl: 'edit-stations.html',
})

export class EditStations {
  private sqlite: SQLite;
  private db: any;
  private station: any = { id: 0, name: "", language: "", url: "" };
  private stationArray: any = [];
  private viewMode: string = "Show";
  private languages: any = [];


  constructor(public navCtrl: NavController, public navParams: NavParams, private ngZone: NgZone) {
    this.sqlite = new SQLite();
    this.sqlite.create({
      name: 'yodio.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
      this.getLanguages();
      this.getStations();
    }, (error) => { // This error is for Create database. If unsuccessful, the app should shutdown.
      console.error("Unable to open database", error);
    });

  }

  addFabClicked() {
    this.station = { id: 0, name: "", language: "", url: "" };
    this.viewMode = "Edit";
  }

  addStation() {
    this.stationCRUD("Add");
  }

  editStation(stat) {
    this.station = stat;
    this.viewMode = "Edit";
  }

  deleteStation(stat) {
    this.station = stat;
    this.stationCRUD("Delete");
  }

  stationCRUD(changeType) {
    console.log(this.station);


    const onSuccess = (resultSet) => {
      console.log("Executed Query for language selection of languages - ", resultSet);
      this.getStations();
      this.viewMode = "Show";

    }

    const onError = (error) => {
      console.error("Unable to execute sql", error);

    }

    if (changeType == "Add" && this.station.id > 0) {
      this.db.executeSql("update yodio_stations set name = ?, language = ?, url = ? where id = ?",
        [this.station.name, this.station.language, this.station.url, this.station.id]).then(onSuccess, onError);
    } else if (changeType == "Add" && this.station.id == 0) {
      this.db.executeSql("insert into yodio_stations (name, language, url) values (?, ?, ?)",
        [this.station.name, this.station.language, this.station.url]).then(onSuccess, onError);
    } else if (changeType == "Delete") {
      this.db.executeSql("delete from yodio_stations where id = ?",
        [this.station.id]).then(onSuccess, onError);
    }
  }

  getStations() {
    this.stationArray = [];
    this.db.executeSql("select * from yodio_stations order by language, name desc", {}).then((resultset) => {
      console.log("Executed Query for language selection of radio stations - ", resultset);
      if (resultset.rows.length > 0) {
        for (let i = 0; i < resultset.rows.length; i++) {
          this.stationArray.push({
            id: resultset.rows.item(i).id, name: resultset.rows.item(i).name,
            language: resultset.rows.item(i).language, url: resultset.rows.item(i).url
          });
        }
      }
      this.ngZone.run(() => this.viewMode = "Show");
    }, (error) => {
      console.error("Unable to execute sql", error);
    });
  }

  getLanguages() {
    this.languages = [];
    this.db.executeSql("select id, language from yodio_languages order by language desc", {}).then((resultset) => {
      console.log("Executed Query for language selection of languages - ", resultset);
      if (resultset.rows.length > 0) {
        for (let i = 0; i < resultset.rows.length; i++) {
          this.languages.push({id: resultset.rows.item(i).id, language:resultset.rows.item(i).language});
        }
      }
    }, (error) => {
      console.error("Unable to execute language select sql", error);
    });

  }

  refresh(){
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }
}
