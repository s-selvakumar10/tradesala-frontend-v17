import { Component, OnInit } from '@angular/core';
import { Review } from '../../core/models/product';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {

	
    reviews: Array<Review>;
    userId: string;
    
    public reviews$: Array<Review>;
    reviewLength: number = 0;
  	constructor(
      private authService: AuthService,
      private productService: ProductService,
    ) {
      this.authService.user.subscribe(user => {
            const isAuth = !!user;
            if(isAuth) {
                this.userId = user.id;
            }     
          
      });
  		
  	}

    ngOnInit(): void {
      this.productService.getAllReviews(this.userId).subscribe(reviews => {        
        this.reviews = reviews;
        this.reviewLength = this.reviews.length;
        
      });
    }

    ratingPercentCalc(rating: number) {
      return rating/5 * 100;
    }

}
