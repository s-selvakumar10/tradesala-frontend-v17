import { Component, OnInit } from '@angular/core';
import { NgbNavConfig } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	providers: [NgbNavConfig]
})
export class AccountComponent implements OnInit {
	active = 1;
	currentJustify = 'end';

	links = [
		{ title: 'One', fragment: 'one' },
		{ title: 'Two', fragment: 'two' }
	];

	constructor(public route: ActivatedRoute) { }

	ngOnInit(): void {		
		if (localStorage.getItem('showWishlist') === 'true') {
			this.active = 4;
			localStorage.removeItem('showWishlist');
		} else if (localStorage.getItem('showOrders') === 'true') {
			this.active = 3;
			localStorage.removeItem('showOrders');
		}
	}

}
