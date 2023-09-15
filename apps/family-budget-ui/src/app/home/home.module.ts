import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { NgxPlaidLinkModule } from "ngx-plaid-link";
import { CoreModule } from '../core/core.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    HomePageRoutingModule,
    NgxPlaidLinkModule,
    CoreModule,
    HttpClientModule
  ],
})
export class HomeModule { }
