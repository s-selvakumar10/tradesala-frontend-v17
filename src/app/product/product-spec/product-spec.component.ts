import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Product} from 'src/app/core/models/product';
@Component({
  selector: 'app-product-spec',
  templateUrl: './product-spec.component.html',
  styleUrls: ['./product-spec.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSpecComponent implements OnInit {

  @Input() product: Product;
  specification: any = [];
  dimensions: any = [];
  length_unit: any = [];
  weight_unit: any = [];
  constructor() { }

  ngOnInit(): void {
    this.specification = this.product.specification;
    this.dimensions = this.product.dimensions;
  }

}
