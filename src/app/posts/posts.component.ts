import { Component, OnInit } from '@angular/core';
import { Post } from './post.model';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  posts: Post[] = [
    { name: 'Lorem Ipsumis', created_at: '2020-08-19', desc: 'Lorem asdfadsf asdfasdfa Lorem', image: 'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg'},
    { name: 'Lorem Ipsumis', created_at: '2020-08-19', desc: 'Lorem asdfadsf asdfasdfa Lorem', image: 'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg' },
    { name: 'Lorem Ipsumis', created_at: '2020-08-19', desc: 'Lorem asdfadsf asdfasdfa Lorem', image: 'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg' },
    { name: 'Lorem Ipsumis', created_at: '2020-08-19', desc: 'Lorem asdfadsf asdfasdfa Lorem', image: 'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
