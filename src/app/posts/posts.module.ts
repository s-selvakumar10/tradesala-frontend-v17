import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostsRoutingModule } from './posts-routing.module';
import { PostsComponent } from './posts.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostGridComponent } from './post-grid/post-grid.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    PostsComponent,
    PostListComponent,
    PostDetailComponent,
    PostGridComponent
  ],
  imports: [
    CommonModule,
    PostsRoutingModule,
    SharedModule
  ]
})
export class PostsModule { }
