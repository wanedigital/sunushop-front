// src/app/shared/pipes/truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { formatDate, DecimalPipe, CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  constructor(
    private decimalPipe: DecimalPipe,
    private currencyPipe: CurrencyPipe
  ) {}

  transform(
    value: any, 
    limit: number = 25, 
    completeWords: boolean = false, 
    ellipsis: string = '...',
    type: 'string' | 'date' | 'number' | 'currency' | 'fcfa' = 'string',
    dateFormat: string = 'dd/MM/yyyy',
    numberFormat: string = '1.0-2',
    currencyCode: string = 'XOF',
    currencySymbolDisplay: 'symbol' | 'code' | 'symbol-narrow' = 'symbol',
    currencyDigits: string = '1.0-0', // Modifié pour pas de décimales
    locale: string = 'fr-FR'
  ): string {
    if (value === null || value === undefined) return '';

    // Gestion DATE
    if (type === 'date') {
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        return formatDate(dateValue, dateFormat, locale);
      }
      return '';
    }

    // Gestion NOMBRE
    if (type === 'number') {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        return this.decimalPipe.transform(num, numberFormat, locale) || String(value);
      }
      return '';
    }

    // Gestion CURRENCY
    if (type === 'currency') {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        const formatted = this.currencyPipe.transform(
          num, 
          currencyCode, 
          currencySymbolDisplay, 
          currencyDigits, 
          locale
        );
        return formatted ? formatted.replace(',00', '') : String(value);
      }
      return '';
    }

    // Gestion FCFA (spécifique pour Sénégal)
    if (type === 'fcfa') {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (!isNaN(num)) {
        // Formatage sans décimales avec espace comme séparateur de milliers
        const formatted = this.decimalPipe.transform(num, '1.0-0', locale);
        return formatted ? formatted.replace(/,/g, ' ') + ' FCFA' : '0 FCFA';
      }
      return '0 FCFA';
    }

    // Gestion STRING avec troncature
    value = String(value);
    if (value.length <= limit) return value;

    if (completeWords) {
      const lastSpace = value.substring(0, limit).lastIndexOf(' ');
      if (lastSpace > -1) {
        return value.substring(0, lastSpace) + ellipsis;
      }
    }

    return value.substring(0, limit) + ellipsis;
  }
}