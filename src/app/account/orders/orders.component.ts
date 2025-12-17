import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Orders } from 'src/app/core/models/order';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Array<Orders>;
  page = 1;
  count = 0;
  pageSize = 3;  
  filterData: { page: number; sortBy: string, email:string, user_id: string } = {
    page: this.page,
    sortBy: '',
    email: '',
    user_id: ''
  };
  badgeClass: number = 0;
  orderLength: number = 0;
  @ViewChild('active') active: ElementRef;
  constructor(private orderService: OrderService, private authService: AuthService) { }

  ngOnInit(): void {
    this.getUserDetails()
  }
  
  toggle(orders, eachOrders) {
    if (orders?.find(e => e.active)?.order_id == eachOrders.order_id) { //same menu clicked
      eachOrders.active = false;
    } else {
      orders?.forEach(e => {
        e.active = false;
      });
      eachOrders.active = true;
    }
  }
  getUserDetails() {
    this.authService.user.subscribe(user => {
      
      if (user?.email) {        
        this.filterData.email = user.email;
        this.filterData.user_id = user.id;
        this.getOrders(this.filterData);
      }
    });
  }
  
  getOrders(userObj) {
    this.orderService.getOrderHistory(userObj).subscribe(response => {
      this.orders = response.orders;
      this.orderLength = response.orders.length;
        const metaData = response.meta;

        this.page = metaData.current_page;
        this.count = metaData.total;
        this.pageSize = metaData.per_page;
    })
  }

  addbadge(){

  }
  handlePageChange(event): void {
    this.page = event;
    this.filterData.page = this.page;
    this.getUserDetails();
    
  }
}
