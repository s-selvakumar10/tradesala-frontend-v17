import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { BreadcrumbService } from './breadcrumb.service';
import { BreadcrumbComponent } from './breadcrumb.component';
import { TruncateWordsPipe } from 'src/app/helper/truncate-words.pipe';

export function breadcrumbServiceFactory(router: Router) {
  return new BreadcrumbService(router);
}

@NgModule({
  declarations: [TruncateWordsPipe, BreadcrumbComponent],
  imports: [CommonModule, RouterModule],
  providers: [
    {
      provide: BreadcrumbService,
      useFactory: breadcrumbServiceFactory,
      deps: [Router],
    },
  ],
  exports: [BreadcrumbComponent],
})
export class BreadcrumbModule {}
