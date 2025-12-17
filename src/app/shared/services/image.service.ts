import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ImageService {

  constructor(private http: HttpClient, private api: ApiService) {}


  public uploadImage(image: File): Observable<Response> {
    let url = `${environment.baseUrl}${'/v1/edit-user'}`;
    const formData = new FormData();
    formData.append('image', image);
    // return this.api
    //   .postApi(`v1/edit-user`, formData)
    //   .pipe(map((resp) => resp.body));

    return this.http.post<any>(url, formData);
  }
}
