import { NgModule } from '@angular/core';
import { ImgZoomComponent } from './image-zoom.component';
import { CommonModule } from '@angular/common';
import { ImgZoomService } from './image-zoom.service';
import { MouseWheelDirective } from './mouse-wheel.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [ImgZoomService],
  declarations: [ImgZoomComponent, MouseWheelDirective],
  exports: [ImgZoomComponent]
})
export class ImgZoomModule { }