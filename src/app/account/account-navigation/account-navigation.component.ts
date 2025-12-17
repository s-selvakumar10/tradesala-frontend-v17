import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-navigation',
  templateUrl: './account-navigation.component.html',
  styleUrls: ['./account-navigation.component.scss']
})
export class AccountNavigationComponent implements OnInit {

	links = [
	  	{ title: 'Account Setting', fragment: 'account-setting' },
	  	{ title: 'Order History', fragment: 'order-history' }
	];
  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

}
