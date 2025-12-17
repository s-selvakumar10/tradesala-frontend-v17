import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstantsearchComponent } from './instantsearch.component';

const routes: Routes = [
  {path: 'instant-search', component: InstantsearchComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstantsearchRoutingModule { }
