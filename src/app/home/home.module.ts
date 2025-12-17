import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeSliderComponent } from './home-slider/home-slider.component';
import { CategorySliderComponent } from './category-slider/category-slider.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PageResolver } from '../shared/common/page.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: {metaInfo: PageResolver},
  }
];

@NgModule({
  declarations: [
    HomeComponent,
    HomeSliderComponent,
    CategorySliderComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    RouterModule,    
  ]
})
export class HomeModule { }
