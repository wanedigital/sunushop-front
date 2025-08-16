// src/app/shared/pipes/new-orders.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newOrders'
})
export class NewOrdersPipe implements PipeTransform {
  transform(orders: any[], statusFilter: string = 'pending'): { count: number, message: string } {
    if (!orders || !Array.isArray(orders)) {
      return { count: 0, message: 'Aucune nouvelle commande' };
    }

    const newOrders = orders.filter(order => order.status === statusFilter);
    const count = newOrders.length;
    
    let message = '';
    if (count === 0) {
      message = 'Aucune nouvelle commande';
    } else if (count === 1) {
      message = '1 nouvelle commande';
    } else {
      message = `${count} nouvelles commandes`;
    }

    return { count, message };
  }
}