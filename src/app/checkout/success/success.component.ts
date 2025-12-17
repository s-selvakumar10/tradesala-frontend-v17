import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {

  orderNumber: string;

  constructor(private router: Router) {
    if (this.router.getCurrentNavigation().extras.state.orderNumber) {
      this.orderNumber = this.router.getCurrentNavigation().extras.state.orderNumber;
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
  }

}
