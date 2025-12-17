import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/shared/services/api.service';
import { CartService } from 'src/app/shared/services/cart.service';

@Component({
  selector: 'app-payment-verify',
  templateUrl: './payment-verify.component.html',
  styleUrls: ['./payment-verify.component.scss'],
})
export class PaymentVerifyComponent implements OnInit {

  paymentMessage: string;
  isLoading: boolean = true;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private api: ApiService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {      
      this.isLoading$.next(true);
      this.verifyOrder(params.orderId);
      //this.paymentInfo(params.orderId);
    });
    
  }

  verifyOrder(orderId) {
    let url = `${'v1/checkout/payment/verify'}`;
    let paymentVerificatonData = {
      orderId: orderId,
    };    
    this.api.postApi(url, paymentVerificatonData).subscribe(
      (res: any) => {
        if(res){
          this.paymentMessage = res.body.status;
          this.successRedirect(res.body.order_number);
          this.isLoading$.next(false);
        }
      },
      (err: any) => {
        if(err){
          this.paymentMessage = err.error.status;
          this.failedRedirect(err.error.status);
          this.isLoading$.next(false);
        }
      }
    );

  }

  paymentInfo(orderId){
    let url = `${'v1/checkout/payment/history'}`;

    let paymentVerificatonData = {
      orderId: orderId,
    };
    this.api.postApi(url, paymentVerificatonData).subscribe(
      (res: any) => {
        if(res){
          this.isLoading$.next(false);
        }        
      },
      (err: any) => {
        if(err){
          this.isLoading$.next(false);
        }
        
      }
    );
  }

  successRedirect(order_number) {
    this.router.navigate(['order/success'], {
      state: { orderNumber: order_number },
    });
    // Refresh cart items once success
    this.cartService.getProducts();
  }
  failedRedirect(status){
    this.router.navigate(['order/failed'], {
      state: { orderFailed: status },
    });
  }
}
