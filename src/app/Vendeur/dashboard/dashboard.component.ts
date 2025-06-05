import { NgForOf } from '@angular/common';
import { Component } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

interface StatCard {
  icon: string;
  value: string;
  label: string;
}

interface Order {
  user: {
    name: string;
    image: string;
  };
  date: string;
  status: {
    text: string;
    class: string;
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [NgForOf,],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  sidebarWidth: number = 250;

  constructor(private layoutService: LayoutService) {
    this.layoutService.sidebarWidth$.subscribe(width => {
      this.sidebarWidth = width;
    });
  }
  stats: StatCard[] = [
    { icon: 'bi-calendar-check', value: '1020', label: 'New Orders' },
    { icon: 'bi-people', value: '2834', label: 'Visitors' },
    { icon: 'bi-currency-dollar', value: 'N$2543.00', label: 'Total Sales' }
  ];

  recentOrders: Order[] = [
    { 
      user: { name: 'Pauline Keny', image: 'https://placehold.co/600x400/png' }, 
      date: '18-10-2021', 
      status: { text: 'Completed', class: 'bg-success' } 
    },
    { 
      user: { name: 'Aldiana', image: 'https://placehold.co/600x400/png' }, 
      date: '01-06-2022', 
      status: { text: 'Pending', class: 'bg-warning' } 
    },
    { 
      user: { name: 'Mamadou Barry', image: 'https://placehold.co/600x400/png' }, 
      date: '14-10-2021', 
      status: { text: 'Process', class: 'bg-info' } 
    },
    { 
      user: { name: 'Amadou', image: 'https://placehold.co/600x400/png' }, 
      date: '01-02-2023', 
      status: { text: 'Pending', class: 'bg-warning' } 
    },
    { 
      user: { name: 'Cheikhou', image: 'https://placehold.co/600x400/png' }, 
      date: '31-10-2021', 
      status: { text: 'Completed', class: 'bg-success' } 
    }
  ];

}