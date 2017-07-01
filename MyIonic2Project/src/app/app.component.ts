import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav } from 'ionic-angular';

import { PlayStationPage } from '../pages/PlayStation/play_station';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { EditStations } from '../pages/edit-stations/edit-stations';
import { EditLanguage } from '../pages/edit-language/edit-language';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  tab1Root: any = PlayStationPage;
  tab2Root: any = EditStations;
  tab3Root: any = EditLanguage;
  private sqlite: SQLite;
  private db: any;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen
  ) {
    this.sqlite = new SQLite();
    this.sqlite.create({
      name: 'yodio.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
    }, (error) => { // This error is for Create database. If unsuccessful, the app should shutdown.
      console.error("Unable to open database", error);
    });
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.db.executeSql('CREATE TABLE IF NOT EXISTS yodio_languages (id INTEGER PRIMARY KEY AUTOINCREMENT, language TEXT, logo TEXT)', {});
    });
  }
}
