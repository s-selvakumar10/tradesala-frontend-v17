import { ChangeDetectionStrategy, Component, Input, NgZone, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../auth/auth.service';
import { Product, Review } from '../../core/models/product';
import { FormControl, FormGroup } from '@angular/forms';
import { ProductService } from 'src/app/core/services/product.service';
import { LoginPopupComponent } from 'src/app/shared/login-popup/login-popup.component';

@Component({
	selector: 'app-product-review',
	templateUrl: './product-review.component.html',
	styleUrls: ['./product-review.component.scss'],
	//changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductReviewComponent implements OnInit {
	@Input() product: Product;
	@Input('totalReviews') total_reviews: number = 0;
	@Input('averageRating') average_rating: number = 0;
	@Input('reviews') reviews: Review[] =[];
	
	closeResult = '';
	private userSub: Subscription;
	
	isShowDivIf = false;
	showToast: Boolean = false;
	isAuthenticated: Boolean = false;
	userId: string;

	reviewForm: FormGroup;
	modalOptions:NgbModalOptions;	

	constructor(
		private ngZone: NgZone,
		private authService: AuthService,
		private productService: ProductService,
		public toastService: ToastService,
		private modalService: NgbModal,
		public toast: ToastrService,

	) { 
		this.authService.user.subscribe(user => {
			const isAuth = !!user;
            if(isAuth) {
                this.userId = user.id;
            }			
	      	
	    });
		this.modalOptions = {
			backdrop:'static',
			backdropClass:'loginBackdrop',
			ariaLabelledBy: 'modal-basic-title', 
			centered: true
		}
	}

	ngOnInit(): void {
		this.userSub = this.authService.user.subscribe(user => {
	      this.isAuthenticated = !!user;	     
		});
			
		this.reviewForm = new FormGroup({
			review: new FormControl(''),
			rating: new FormControl(''),
		});
	}
	
	onSubmit() {
		if(this.reviewForm.valid) {
			const {review, rating} = this.reviewForm.value;
			
			this.productService.storeProductReview(this.product.slug, rating, review).subscribe(response => {
				// Success message
				if(response.status == 201){
					this.toast.success(response.body.message, 'Success!');
				}
				
				this.reviewForm.reset();
			});
		}
	}

	ratingPercentCalc(rating: number) {
		return rating/5 * 100;
	}
	
	showReviewForm(event){

		if(this.isAuthenticated == true){
			this.isShowDivIf = true;
			this.showToast = false;
		} else {
			this.loginPopup();			
			this.showToast = true;
			this.isShowDivIf = false;
		}
		
	}
	loginPopup() {
		this.modalService.open(LoginPopupComponent, this.modalOptions);
	}
	
	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
		return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
		return 'by clicking on a backdrop';
		} else {
		return `with: ${reason}`;
		}
	}
	  
	ngOnDestroy() {
	    this.userSub.unsubscribe();
  	}

}
