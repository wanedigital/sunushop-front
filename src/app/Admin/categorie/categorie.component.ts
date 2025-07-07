import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-categorie',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {

  categories: any[] = [];


  constructor(private http: HttpClient) {} 
 

  ngOnInit(): void {
    this.fetchCategories();
    
  }


  fetchCategories() {
    this.http.get<any[]>('http://127.0.0.1:8000/api/categories').subscribe(
      data => this.categories = data,
      error => console.error('Erreur lors du chargement des catégories :', error)
    );
  }

}
