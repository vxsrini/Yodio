import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditStations } from './edit-stations';

@NgModule({
  declarations: [
    EditStations,
  ],
  imports: [
    IonicPageModule.forChild(EditStations),
  ],
  exports: [
    EditStations
  ]
})
export class EditStationsModule {}
