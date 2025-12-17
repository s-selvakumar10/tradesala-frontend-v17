import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-refund-view',
  templateUrl: './refund-view.component.html',
  styleUrls: ['./refund-view.component.scss']
})
export class RefundViewComponent implements OnInit {
  conditions: any = [];
  reasons: any = [];
  resolutions: any = [];
  shipments: any = [];
  invoices: any = [];
  selectedValues: any = {};
  selectedInvoice: any = [];
  selectedShipment: any = [];
  orderId: any;
  submitted: boolean = false;
  returnForm: FormGroup;
  file: any = []; // Variable to store file
  toBase64: any;
  invoiceId: string;
  shipmentId: number;
  orderNo: string;
  imageSrc: any = [];
  invoiceNo: number;
  prodQty: number = 0;
  fileUploadArr: any = [{ name: '', image: null }];
  @ViewChild('changeQty') input: ElementRef;

  constructor(private orderService: OrderService, private route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder, public toast: ToastrService) {
    this.route.params.subscribe((params) => {
      this.orderId = Number(params.id);
      this.invoiceId = params.invId;
      this.createReturnOrder(this.orderId);
    });
    this.route.queryParams.subscribe((params) => {
      this.orderNo = params.ord_no
    });
  }

  ngOnInit(): void {
    this.createForm();
  }

  createReturnOrder(orderId) {
    this.orderService.creteReturnOrder(orderId).subscribe(res => {
      this.conditions = res.conditions;
      this.reasons = res.reasons;
      this.resolutions = res.resolutions;
      res.shipments?.forEach(e => {
        this.shipments.push(e);
      });
      res.invoices?.forEach(e => {
        this.invoices.push(e);
      });
      this.invoiceChange();
    })
  }

  createForm() {
    this.returnForm = this.formBuilder.group({
      reason: ['', Validators.required],
      condition: ['', Validators.required],
      items: this.formBuilder.array([]),
      message: ['', Validators.required]
    });
  }

  invoiceChange() {
    this.selectedInvoice = this.invoices?.find(e => e.invoice_no == this.invoiceId);
    this.selectedInvoice?.items?.forEach(e => {
      e.orderedQty = e.qty;
      e.isChecked = false;
    });
    this.selectedShipment = this.shipments;
    this.selectedShipment?.forEach(e => {
      this.shipmentId = e.shipment_id;
    });

  }

  submit(formName) {
    let msg = '';
    this.selectedInvoice?.items?.forEach(e => {
      if (e.isChecked && e.qty >= e.bulk_order_qty) {
        msg = 'This product ' + (e.name) + ' cannot be returned.'
      }
    });
    this.fileUploadArr?.forEach(e => {
      if (e.image) {
        this.file.push({ image: e.image });
      }
    });
    if (formName.invalid) {
      this.toast.warning('Please Enter All Field');
      return;
    } else if (this.selectedInvoice?.items?.length == 1 && this.selectedInvoice?.items?.some(e => e.has_return == false)) {
      this.toast.warning('This order cannot be returned.');
    } else if (msg != '') {
      this.toast.error(msg);
    } else if (!this.selectedInvoice?.items?.some(e => e.isChecked)) {
      this.toast.error('Please select at least any one product');
    } else if (this.file?.length == 0) {
      this.toast.error('Please select at least one file');
    } else {

      let obj: any = {
        order_id: this.orderId,
        invoice_id: this.selectedInvoice.invoice_id,
        shipment_id: this.shipmentId,
        reason: this.returnForm.value?.reason,
        condition: this.returnForm.value?.condition,
        resolution: 'Refund',
        message: this.returnForm.value?.message,
        items: [],
        files: this.file
      }
      this.selectedInvoice?.items?.forEach(e => {
        if (e.isChecked) {
          obj.items.push({
            "product_id": e.id,
            "variant_id": e.variant_id,
            "qty": e.qty
          })
        }
      });

      this.orderService.postReturnOrder(obj).subscribe(res => {
        if (res.status) {
          this.toast.success(res.msg);
          localStorage.setItem('showOrders', "true");
          setTimeout(() => {
            this.router.navigate(['/account/dashboard']);
          }, 500);
        } else {
          this.toast.error(res.msg)
        }
      })
    }
  }
  selectProducts(val) {
    val.isChecked = !val.isChecked;
  }

  // On file Select
  onChange(event, index) {
    let files = event.target.files;
    this.getBase64(files[0]).then(data => {
      this.fileUploadArr[index] = { name: files[0].name, image: data }
    });
    
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  backOrder(event): void {
    this.router.navigate(['/account/orders/details', this.orderId]);
    localStorage.setItem('showOrders', "true");
  }
  incQnt(prod) {
    prod.qty = (prod.qty >= prod.orderedQty) ? prod.orderedQty : prod.qty + 1;
  }
  decQnt(prod) {
    prod.qty = prod.qty - 1;
    if (prod.qty == 0) {
      prod.qty = 1
    }
  }

}
