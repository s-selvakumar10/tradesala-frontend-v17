import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
@Component({
  selector: 'app-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.scss']
})
export class PaymentFailedComponent implements OnInit {

  orderFailed: string;

  constructor(private router: Router) {
    // if (this.router.getCurrentNavigation().extras.state.orderFailed) {
    //   this.orderFailed = this.router.getCurrentNavigation().extras.state.orderFailed;
    // } else {
    //   this.router.navigate(['/']);
    // }
  }

  ngOnInit(): void {
  }

}
