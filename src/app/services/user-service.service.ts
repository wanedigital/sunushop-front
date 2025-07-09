import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private apiUrl = 'http://127.0.0.1:8000/api/users';

  constructor(private http: HttpClient) { }

  getUsers(searchQuery?: string): Observable<any> {
   const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
   const headers = new HttpHeaders({ 
    'Authorization': `Bearer ${token}`
   });

   let url = 'http://127.0.0.1:8000/api/users';
   if (searchQuery && searchQuery.trim() !== '') {
     url += `?search=${encodeURIComponent(searchQuery)}`;
    }

   return this.http.get<any>(url, { headers });
  }

  deleteUser(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const headers = new HttpHeaders({ 
    'Authorization': `Bearer ${token}`
   });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

}
