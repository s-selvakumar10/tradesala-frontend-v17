import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/shared/services/api.service';
import { Orders } from '../models/order';

@Injectable({
    providedIn: 'root',
})
export class AddressService {
    constructor(private api: ApiService) { }

    storeAddress(filters: {}): Observable<any> {
        return this.api
            .postApi(`v1/address/store`, filters)
            .pipe(map((resp) => resp.body));
    }

    listAddress(userId: number): Observable<any> {
        return this.api
            .get<any>(`v1/address/${userId}/list`)
            .pipe(map((resp) => resp.address));
    }

    getShippingAddress(userId: any): Observable<any> {
        return this.api
            .get<any>(`v1/shipping-address/${userId}/list`)
            .pipe(map((resp) => resp));
    }

    removeAddress(userId: number, id: number) {
        return this.api.deleteApi(`v1/address/destroy/${userId}/${id}`)
            .pipe(map((resp) => resp));
    }

    updateAddress(userId: number, id: number, obj: any) {
        return this.api.postApi(`v1/address/update/${userId}/${id}`, obj)
            .pipe(map((resp) => resp.body));
    }

}
