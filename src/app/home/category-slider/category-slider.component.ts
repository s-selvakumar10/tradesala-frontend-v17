import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-category-slider',
  templateUrl: './category-slider.component.html',
  styleUrls: ['./category-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategorySliderComponent implements OnInit {

  constructor() { }
  allcategorySlider: OwlOptions = {
    loop: false,
    autoplay: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    nav: true,
    responsive: {
      0: {
        items: 4,
      },
      480: {
        items: 4,
      },
      767: {
        items: 4,
      },
      940: {
        items: 9,
      },
    },
  };
  ngOnInit(): void {
  }

}
