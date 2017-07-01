import { Component, NgZone } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { MediaPlugin, MediaObject } from '@ionic-native/media';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';



@Component({
  selector: 'play_station_page',
  templateUrl: 'play_station.html'
})
export class PlayStationPage {
  private sqlite: SQLite;
  private db: any;
  rowValues: Row[] = [];
  private firstTime: boolean = false;
  frequentLang: string[] = [];
  private media: MediaPlugin = new MediaPlugin();
  private itemPlayed = 0;
  private mediaObj: MediaObject;
  currLang: string = "All";


  constructor(private ngZone: NgZone, public navCtrl: NavController,
    public navParams: NavParams, private toast: Toast, private platform: Platform) {
    this.presentToast("Starting the app");
    this.sqlite = new SQLite();
    this.sqlite.create({
      name: 'yodio.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.db = db;
      this.getStations('All');
    }, (error) => { // This error is for Create database. If unsuccessful, the app should shutdown.
      console.error("Unable to open database", error);
    });
  }

  public getStations(qLang) {
    // Exexute select statement, else assume it is the first time and create tables to initialize.
    this.rowValues = [];
    let query: string = "select * from yodio_stations";

    if (qLang != 'All') {
      query = query + " where language = '" + qLang + "'";
    }

    query = query + " order by language, name"

    console.log("Query to be executed ", query);
    this.db.executeSql(query, {}).then((resultset) => {
      console.log("Executed Query - for selection and creating the list", resultset);
      this.ngZone.run(() => this.currLang = qLang);
      console.log("the lang queried is ", this.currLang);

      if (resultset.rows.length > 0) {
        for (let i = 0; i < resultset.rows.length; i++) {
          console.log("Id = " + resultset.rows.item(i).id);
          let rowV = new Row(resultset.rows.item(i).id, resultset.rows.item(i).name, resultset.rows.item(i).language, resultset.rows.item(i).url, resultset.rows.item(i).frequency);
          this.rowValues[i] = rowV;
        }
      }
      this.countByLanguage(qLang);
    }, (error) => { // This error is when selecting the radio stations. A failure means this is the first time.
      console.error("Error occured when quering the yadio_stations ", error);
      this.firstTime = true;
      this.db.executeSql("CREATE TABLE IF NOT EXISTS yodio_stations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, language TEXT, url text, frequency INTEGER)", {}).then((data) => {
        console.log("TABLE CREATED: ", data);
        if (data.rows.length == 0) {
          this.intializeStations();
          this.presentToast("First Time - Initiatializing the stations");
          this.getStations('All');
        }
      }, (error) => { // This error is for creating the tables first time. If unsuccessful, the app should shutdown.
        console.error("Unable to execute sql", error);
        this.presentToast("Unable to execute system table queries");
      });
    });
  }

  public intializeStations() {

    const onSuccess = () => { console.log('Successfully inserted station'); }
    const onError = (error) => { console.error(error.message); }
    this.db.executeSql("insert into yodio_languages (language) values ('Tamil')", {});
    this.db.executeSql("insert into yodio_languages (language) values ('English')", {});
    this.db.executeSql("insert into yodio_languages (language) values ('Hindi')", {});
    this.db.executeSql("insert into yodio_languages (language) values ('Telegu')", {});

    for (let stat of this.initStations) {
      this.db.executeSql("insert into yodio_stations (name, language, url, frequency) values (?,?,?,?)",
        [stat.name, stat.language, stat.url, stat.frequency]).then(onSuccess, onError);
    }
  }

  public countByLanguage(qLang): string[] {
    this.frequentLang = [];
    this.db.executeSql("select language from yodio_stations group by language order by sum(frequency) desc", {}).then((resultset) => {
      console.log("Executed Query for language selection and menu- ", resultset);
      if (resultset.rows.length > 0) {
        this.frequentLang.push("All");
        for (let i = 0; i < resultset.rows.length; i++) {
          this.frequentLang.push(resultset.rows.item(i).language);
        }
        this.ngZone.run(() => this.currLang = qLang);
      }
    }, (error) => {
      console.error("Unable to execute sql", error);
      this.presentToast("Unable to execute query for language display");
      this.platform.exitApp();
    });
    return this.frequentLang;
  }


  //Function to Play Station or Pause Station being played.  
  public actionStation(event, action) {
    console.dir(event);
    console.log(JSON.stringify(event));

    this.db.executeSql("select url from yodio_stations where id = " + event.target.id, {}).then((resultset) => {
      console.log("Executed Query for playing the station - ", resultset);
      if (resultset.rows.length > 0) {
        const onStatusUpdate = (status) => {
          console.log("Status Change = ", status);
          if (status == 2) {
            this.ngZone.run(() => this.itemPlayed = event.target.id);
            console.log("Current item after play ", this.itemPlayed);
          } else if (status == 4) {
            this.ngZone.run(() => this.itemPlayed = 0);
          }
        }
        const onSuccess = () => { console.log('Action is successful.'); }
        const onError = (error) => {
          //console.error(error.message);

          this.ngZone.run(() => this.itemPlayed = 0);
          this.presentToast("Unable to play station. Check URL");
        }
        //this.media = new MediaPlugin();



        if (action == "play") {

          this.mediaObj && this.mediaObj.release();
          this.mediaObj = this.media.create(resultset.rows.item(0).url, onStatusUpdate, onSuccess, onError);
          console.log("Item requested for play ", event.target.id);
          this.mediaObj.play();
        } else if (action == "stop") {
          this.mediaObj.stop();
        }
      }
    }, (error) => {
      console.error("Unable to execute the url select sql", error);
      this.presentToast("Unable to play station");
    });

  }

  refresh() {
    this.mediaObj && this.mediaObj.release();
    this.navCtrl.setRoot(this.navCtrl.getActive().component);
  }

  presentToast(message) {
    this.toast.show(message, '3000', 'center').subscribe(
      toast => {
        console.log(toast);
      }
    );
    /*let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'middle',
      cssClass: 'toastCss'
    });
    toast.present();*/
  }

  private initStations = [
    {
      "name": "Suriyam FM",
      "language": "Tamil",
      "url": "http://104.238.193.114:7077/;stream.mp3",
      "frequency": 0
    },
    {
      "name": "Radio City",
      "language": "Tamil",
      "url": "http://prclive1.listenon.in:9948/;",
      "frequency": 0
    },
    {
      "name": "Illayaraja Radio",
      "language": "Tamil",
      "url": "http://66.55.145.43:7763/;",
      "frequency": 0
    },
    {
      "name": "AR Rahaman Radio",
      "language": "Tamil",
      "url": "http://66.55.145.43:7770/;",
      "frequency": 0
    },
    {
      "name": "Old Tamil Songs",
      "language": "Tamil",
      "url": "http://www.geethamradio.com:8020/old_hifi.mp3",
      "frequency": 0
    },
    {
      "name": "Harris Jeyaraj Radio",
      "language": "Tamil",
      "url": "http://66.55.145.43:7812/;",
      "frequency": 0
    },
    {
      "name": "New Songs",
      "language": "Tamil",
      "url": "http://66.55.145.43:7759/;",
      "frequency": 0
    },
    {
      "name": "Radio City",
      "language": "Hindi",
      "url": "http://prclive1.listenon.in:9960/;",
      "frequency": 0
    },
    {
      "name": "Big FM",
      "language": "Hindi",
      "url": "http://209.15.226.17:9016/stream",
      "frequency": 0
    },
    {
      "name": "Hindi Desi Bollywood",
      "language": "Hindi",
      "url": "http://50.7.77.114:8296/;",
      "frequency": 0
    },
    {
      "name": "MastRadio",
      "language": "Hindi",
      "url": "http: //stream.mastradio.net:8000/;",
      "frequency": 0
    },
    {
      "name": "Radio Mirchi",
      "language": "Tamil",
      "url": "http://164.132.63.75:9994/;",
      "frequency": 0
    }
  ];
}


export class Row {
  private id: number;
  private name: string;
  private language: string;
  private url: string;
  private frequency: number;

  constructor(id, name, language, url, frequency) {
    this.id = id;
    this.name = name;
    this.language = language;
    this.url = url;
    this.frequency = frequency
  }

  public set $id(value: number) {
    this.id = value;
  }

  public set $name(value: string) {
    this.name = value;
  }

  public set $language(value: string) {
    this.language = value;
  }

  public set $url(value: string) {
    this.url = value;
  }

  public set $frequency(value: number) {
    this.frequency = value;
  }

  public get $id(): number {
    return this.id;
  }

  public get $name(): string {
    return this.name;
  }

  public get $language(): string {
    return this.language;
  }

  public get $url(): string {
    return this.url;
  }

  public get $frequency(): number {
    return this.frequency;
  }

}

