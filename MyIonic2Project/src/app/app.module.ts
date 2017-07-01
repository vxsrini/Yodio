import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { PlayStationPage } from '../pages/PlayStation/play_station';
import { EditStations } from '../pages/edit-stations/edit-stations';
import { EditLanguage } from '../pages/edit-language/edit-language';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {MediaPlugin} from '@ionic-native/media';
import { Toast } from "@ionic-native/toast";

@NgModule({
  declarations: [
    MyApp,
    PlayStationPage,
    EditStations,
    EditLanguage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PlayStationPage,
    EditStations,
    EditLanguage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    MediaPlugin,
    Toast,
   // MediaObject,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
