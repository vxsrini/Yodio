import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditLanguage } from './edit-language';


@NgModule({
  declarations: [
    EditLanguage,
  ],
  imports: [
    IonicPageModule.forChild(EditLanguage),
  ],
  exports: [
    EditLanguage
  ]
})
export class EditLanguageModule {}
