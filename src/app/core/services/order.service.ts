import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/shared/services/api.service';
import { Orders } from '../models/order';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class OrderService {
    constructor(private api: ApiService, private http: HttpClient) { }
   
    getOrderHistory(filters: {}): Observable<{ meta:any; orders: Orders[]}> {
        return this.api
            .postApi(`v1/orders`, filters)
            .pipe(map((resp) => resp.body));
    }

    getOrderById(orderId: number): Observable<Orders> {
        return this.api
            .get<any>(`v1/order/view/${orderId}`)
            .pipe(map((resp) => resp));
    }
    getInvoivePdf(orderId: number, sellerId: number): Observable<any>{        
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        let url = `${environment.baseUrl}${'/v1/invoice/'}${orderId}${'/'}${sellerId}`;
        return this.http.get(url, { headers: headers, responseType: 'blob' });
    }
    getAllInvoivePdf(orderId: number): Observable<any>{       
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        let url = `${environment.baseUrl}${'/v1/invoice/'}${orderId}`;
        return this.http.get(url, { headers: headers, responseType: 'blob' });
    }
    creteReturnOrder(orderId: number): Observable<any> {
        return this.api
            .get<any>(`v1/order/return/create/${orderId}`)
            .pipe(map((resp) => resp));
    }

    postReturnOrder(obj: {}): Observable<any> {
        return this.api
            .postApi(`v1/order/return/store`, obj)
            .pipe(map((resp) => resp.body));
    }

    cancelReturnOrder(obj: {}): Observable<any> {
        return this.api
            .postApi(`v1/order/cancel`, obj)
            .pipe(map((resp) => resp.body));
    }
}
