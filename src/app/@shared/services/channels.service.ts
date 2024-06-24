import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private baseUrl = environment.apiUrl + 'channels';
  constructor(private http: HttpClient) {}

  getAllChannels(
    page: number,
    size: number,
    search: string = '',
    startDate,
    endDate
  ): Observable<any> {
    const data = {
      page: page,
      size: size,
      search: search,
      startDate: startDate,
      endDate: endDate,
    };
    return this.http.post(`${this.baseUrl}/get/`, data);
  }

  createChannel(data){
    return this.http.post(`${this.baseUrl}/create-channel`, data);
  }

  changeChannelStatus(id, feature): Observable<any> {
    return this.http.get(`${this.baseUrl}/feature/${id}?feature=${feature}`);
  }

  deleteChannel(id): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getChannelById(id): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getMetaData(url) {
    return this.http.post(`${environment.apiUrl}/get-meta`, url);
  }
  getProfile(id): Observable<Object> {
    return this.http.get<Object>(`${environment.apiUrl}customers/profile/${id}`);
  }
  getNotificationList(id: number, data = {}): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/get-notification/${id}?q=${Date.now()}`,
      data
    );
  }

  getCategory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-category`);
  }

  subscribeChannel(data): Observable<any> {
    return this.http.post(`${environment.apiUrl}/subscribe/create/`, data);
  }

  unsubscribeChannel(data): Observable<any> {
    return this.http.delete(`${environment.apiUrl}subscribe/remove/${data.ProfileId}/${data.SubscribeChannelId}`);
  }
}
