import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { WebsiteSetting } from '../models/website-setting.model';

@Injectable({
  providedIn: 'root',
})
export class WebsiteSettingService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/WebsiteSetting`;

  getSettings(): Observable<WebsiteSetting> {
    return this.http.get<WebsiteSetting>(this.apiUrl);
  }

  saveSettings(formData: FormData): Observable<WebsiteSetting> {
    return this.http.post<WebsiteSetting>(this.apiUrl, formData);
  }
}
