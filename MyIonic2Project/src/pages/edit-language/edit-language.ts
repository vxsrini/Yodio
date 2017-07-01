import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";


@IonicPage()
@Component({
  selector: 'page-edit-language',
  templateUrl: 'edit-language.html',
})
export class EditLanguage {

  private appMode: any = "Show";
  private stationLang = { id: 0, name: "" };
  private sqlite: SQLite;
  private db: any;
  private languages: any = [];
  private qry : string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, private ngZone: NgZone) {
    this.sqlite = new SQLite();
    this.sqlite.create({
      name: 'yodio.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
      this.getLanguages();
    }, (error) => { // This error is for Create database. If unsuccessful, the app should shutdown.
      console.error("Unable to open database", error);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditLanguage');
  }

  addLanguage() {
    console.log("into add language");
    this.appMode = "Add";
    this.stationLang.id = 0;
    this.stationLang.name = "";
  }

  addLangForm() {
    console.log("values = ", this.stationLang.name);
    if (this.stationLang.id > 0){
      this.qry = "update yodio_languages set language = '" + this.stationLang.name + "' where id = " + this.stationLang.id;
    } else{
      this.qry = "insert into yodio_languages (language) values ('" + this.stationLang.name + "')";
    }
    this.db.executeSql(this.qry, {}).then((resultset) => {
      console.log("Executed Query for language insert / update - ", resultset);
      this.getLanguages();
      this.ngZone.run(() => this.appMode = "Show");
    }, (error) => {
      console.error("Unable to execute sql for insert langauge", error);
    });
  }

  getLanguages() {
    this.languages = [];
    this.db.executeSql("select id, language from yodio_languages order by language", {}).then((resultset) => {
      console.log("Executed Query for language selection of languages - ", resultset);
      if (resultset.rows.length > 0) {
        for (let i = 0; i < resultset.rows.length; i++) {
          this.languages.push({id: resultset.rows.item(i).id, name:resultset.rows.item(i).language});
        }
      }
    }, (error) => {
      console.error("Unable to execute language select sql", error);
    });

  }

  editLanguage(id, name) {
    this.stationLang.id = id;
    this.stationLang.name = name;
    this.appMode = 'Add';
  }

  deleteLanguage(id) {
    this.db.executeSql("delete from yodio_languages where id = ?", [id]).then((resultset) => {
      console.log("Executed Query for language deletiom - ", resultset);
      this.getLanguages();
      this.appMode = 'Show';
    }, (error) => {
      console.error("Unable to execute language delete sql", error);
    });
  }

  refresh(){
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }
}
