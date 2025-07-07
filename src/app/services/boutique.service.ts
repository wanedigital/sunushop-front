import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {

  private apiUrl = 'http://localhost:8000/api/boutiques'; 
  
  constructor(private http: HttpClient) { }
  

  deleteBoutique(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

 
  
}
