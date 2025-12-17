import { Injectable } from '@angular/core';
import { ImgZoomMode } from './image-zoom.enum';

@Injectable({
  providedIn: 'root'
})
export class ImgZoomService {

  zoomMode = ImgZoomMode.HoverZoom;
  zoomBreakPoints;
  constructor() { }

  // setZoomMode(zoomMode) {
  //   this.zoomMode = zoomMode;
  // }

  setZoomBreakPoints(breakPoints) {
    this.zoomBreakPoints = breakPoints;
  }
}
