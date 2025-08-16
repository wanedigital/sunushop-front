// src/app/shared/pipes/stock-alert.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockAlert'
})
export class StockAlertPipe implements PipeTransform {

  transform(products: any[], threshold: number = 10): any {
    if (!products || !Array.isArray(products)) {
      return {
        count: 0,
        message: '',
        products: []
      };
    }

    const lowStockProducts = products.filter(p => p.quantite < threshold);
    const count = lowStockProducts.length;
    
    let message = '';
    if (count === 0) {
      message = 'Stock normal';
    } else if (count === 1) {
      message = '1 produit en stock critique';
    } else {
      message = `${count} produits en stock critique`;
    }

    return {
      count,
      message,
      products: lowStockProducts,
      hasAlert: count > 0
    };
  }
}