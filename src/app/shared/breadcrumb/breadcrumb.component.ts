import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Breadcrumb } from './breadcrumb.model';
import { BreadcrumbService } from './breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class BreadcrumbComponent {
  breadcrumbs: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);
  @Input() category: Breadcrumb[] = [];
  @Input() subcategory: Breadcrumb[] = [];
 

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.breadcrumbChanged.subscribe((crumbs: Breadcrumb[]) => {     
      this.onBreadcrumbChange(crumbs);
    });   
  }
  private onBreadcrumbChange(crumbs: Breadcrumb[]) {
    this.breadcrumbs.next(crumbs);
  }
}