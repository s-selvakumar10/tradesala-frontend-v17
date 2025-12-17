import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Orders } from 'src/app/core/models/order';
import { OrderService } from 'src/app/core/services/order.service';
import { ApiService } from 'src/app/shared/services/api.service';
import { Observable } from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  orderData: Array<Orders>;

  order: any;
  stateList: any = {};
  countryList: any = {};
  pdfUrl: string;
  //order_status: any = ["Order Placed", "Pending", "Processing", "Cancelled", "Ready to Shipment", "Shipment Moved", "Dispatched", "Delivered", "Returned"];
  order_status: any;
  return_status: any;
  cancelComments: string = '';
  cancelOrderObj: any = {};
  modalOptions: NgbModalOptions;
  constructor(
    private toastrService: ToastrService,
    private modalService: NgbModal, 
    private orderService: OrderService, 
    private router: Router, 
    private route: ActivatedRoute,
    private api: ApiService
  ) { 
    this.modalOptions = {
      backdrop:'static',
      backdropClass:'loginBackdrop',
      ariaLabelledBy: 'modal-basic-title', 
      centered: true,
      size: 'sm'
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      let orderId = params.id;
      this.getCommonData();
      this.getOrders(orderId);
    });
  }
  printAllInvoice(orderId, orderNo){
    this.orderService.getAllInvoivePdf(orderId).subscribe((data: any) => {       
      var file = new Blob([data], { type: 'application/pdf' })
      var fileURL = URL.createObjectURL(file);        
     // if you want to open PDF in new tab
     //window.open(fileURL); 
     var a         = document.createElement('a');
     a.href        = fileURL; 
     a.target      = '_self';
     a.download    = orderNo+'.pdf';
     document.body.appendChild(a);
     a.click();
    }, 
      err=>{

    });
  }
  getOrders(orderId) {
    this.orderService.getOrderById(orderId).subscribe(response => {
      this.order = response;
      //console.log('order', this.order);
      this.order_status = this.order.order_status;
      this.return_status = this.order.return_order_status;  
      //console.log(this.return_status);  
      this.order.products?.forEach(element => {
        element.order_status = [];
        element.return_status = [];
        let c = 1;
        if ([2, 5, 6, 7].includes(element.statusVal)) {          
          //element['order_status'] = this.order_status.filter(e=> ![3, 8, 9, 10, 11, 12].includes(e.id) && e );
          element['order_status'] = this.order_status.filter(e=> [2, 5, 6, 7].includes(e.id) && e );
        } else if([3, 11, 12].includes(element.statusVal) && element.is_cancel){
          element['order_status'] = this.order_status.filter(e=> [2, 3, 11, 12].includes(e.id) && e );
        } else if([8].includes(element.statusVal)){
          element['order_status'] = this.order_status.filter(e=> [2, 5, 6, 7, 8].includes(e.id) && e );
        }
        else if([9].includes(element.statusVal)){
          element['order_status'] = this.order_status.filter(e=> [2, 5, 6, 7, 9].includes(e.id) && e );
        } else if([10, 11, 12].includes(element.statusVal) && !element.is_cancel){
          element['order_status'] = this.order_status.filter(e=> [2, 5, 6, 10, 11, 12].includes(e.id) && e );
        } 
        
        if(this.return_status.length){
          if ([1,4,5,7,9].includes(element.return_val)) {
            element['return_status'] = this.return_status.filter(e=> [1,4,5,7,9].includes(e.id) && e );
          } else if([2].includes(element.return_val)) {
            element['return_status'] = this.return_status.filter(e=> [1,2].includes(e.id) && e );
          } else if([3].includes(element.return_val)) {
            element['return_status'] = this.return_status.filter(e=> [1,3].includes(e.id) && e );
          } else if([6].includes(element.return_val)) {
            element['return_status'] = this.return_status.filter(e=> [1,4,5,6].includes(e.id) && e );
          } else if([8].includes(element.return_val)) {
            element['return_status'] = this.return_status.filter(e=> [1,4,5,7,8].includes(e.id) && e );
          }
          
        }
       
        // this.order_status?.forEach(e => {
        //   if (element.status == "Order Confirmed" || element.status == "Shipped" || element.status == "Out for Delivery" || element.status == "Delivered") {
        //     if (e.name != "Cancelled") {
        //       element.order_status.push({ id: c++, name: e.name });
        //       console.log('element.order_status',element.order_status);
        //     }
        //   } else if (element.status == "Completed") {
        //     if (e.name != "Cancelled" && e.name != "Returned") {
        //       element.order_status.push({ id: c++, name: e.name })
        //     }
        //   } else if (element.status == "Returned") {
        //     if (e.name != "Cancelled") {
        //       element.order_status.push({ id: c++, name: e.name })
        //     }
        //   } else {
        //     element.order_status.push({ id: c++, name: e.name })
        //     console.log('element.order_status',element.order_status);
        //   }
        // });
        
        // if (element.status == "Cancelled") {
        //   element.order_status = element.order_status?.slice(0,element.order_status.findIndex(e => e.name == 'Cancelled')+1)
        // }
        element.statusVal = element.order_status?.find(x => x.id == element.statusVal)?.id;
        element.return_val = element.return_status?.find(x => x.id == element.return_val)?.id;

        element.order_status.forEach((item, i) => {
          if((i == 2 || i == 4 ) && item.id == 12){
            item.id =11;    
          }
          if((i == 3 || i == 5) && item.id == 11){
            item.id =12;       
          }
          if(element.status == 'Refunded' && element.statusVal == 11){
            element.statusVal = 12;
          } else if(element.status == 'Refund Initiated' && element.statusVal == 12){
            element.statusVal = 11;
          }
        });
      });
      
    })
  } 

  getPdf(invoiceId, sellerId, invoiceNo){
    
    this.orderService.getInvoivePdf(invoiceId, sellerId)
    .subscribe(
      (data: any) => {       
         var file = new Blob([data], { type: 'application/pdf' })
         var fileURL = URL.createObjectURL(file);        
        // if you want to open PDF in new tab
        //window.open(fileURL); 
        var a         = document.createElement('a');
        a.href        = fileURL; 
        a.target      = '_self';
        a.download    = invoiceNo+'.pdf';
        document.body.appendChild(a);
        a.click();
      },
      (error) => {
        console.log('getPDF error: ',error);
      }
    );
  }
  getCommonData() {
    let url = `${'/v1/states'}`;
    this.api.getAll(url).subscribe((commonRes: any) => {
      let x = {};
      commonRes?.forEach((element: any) => {
        x[element.id] = element.name;
      });
      this.stateList = x;
      
    })
    url = `${'/v1/country'}`;
    this.api.getAll(url).subscribe(commonRes => {
      let x = {};
      let c = commonRes['100'];
      x[c.id] = c.name;
      this.countryList = x;
      
    })
  }
  backOrder(event):void {
    //console.log(event);
    this.router.navigate(['/account/dashboard']);
    localStorage.setItem('showOrders',"true");
  }
  returnOrder(orderId, invoiceId, orderNo){
   
    this.router.navigate(['/account/orders/refund-view/'+orderId+'/'+invoiceId], {
      queryParams: {
        ord_no: orderNo,
      }
    });
  }
  cancelOrder(comments) {
    if (comments == '') {
      this.toastrService.warning('Please enter comments and proceed', 'Warning!');
    } else {
      this.cancelOrderObj.comments = comments;      
      this.orderService.cancelReturnOrder(this.cancelOrderObj).subscribe((res: any) => {
        if (res.status == true) {
          this.toastrService.success(res.msg, 'Success!');
          localStorage.setItem('showOrders', "true");
          this.router.navigate(['/account/dashboard']);
        } else {
          this.toastrService.error(res.message, 'Error!');
        }
      });
    }
  }
  openSm(orderId, sellerId, content) {
    this.cancelOrderObj = {};
    let obj = {
      order_id: orderId,
      seller_id: sellerId,
      comments: ''
    }
    this.cancelOrderObj = obj;
    this.modalService.open(content, this.modalOptions);
  }
}
