import { Component, OnInit } from '@angular/core';
import { StatistiqueService } from '../../services/statistique.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [],
  styleUrls: ['./dashboard.component.css']   

})
export class DashboardComponent implements OnInit{

ventes: any[] = [];
  clients: any[] = [];
constructor(private statsService:StatistiqueService){}

  ngOnInit(): void {
    this.statsService.getVentesParPeriode('mois').subscribe(data => {
      this.ventes = data.data;
      console.log("stat :",this.ventes)
    });

    this.statsService.getMeilleursClients().subscribe(data => {
      this.clients = data.data;
            console.log("stat :",this.clients)

    });
  

  }


}