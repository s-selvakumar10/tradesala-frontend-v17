import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-products',
  templateUrl: './empty-products.component.html',
  styleUrl: './empty-products.component.scss'
})
export class EmptyProductsComponent {
  @Input() title:string = '';
  @Input() count:number = 0;

  constructor() { 
    
  }

  generateNumberArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  ngOnChanges() {
   
  }
}
