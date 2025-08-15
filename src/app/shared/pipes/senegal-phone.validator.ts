import { AbstractControl, ValidatorFn } from '@angular/forms';

export function senegalPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null; // Ne pas valider si le champ est vide
    }

    // Format attendu : +221 XX XXX XX XX
    const regex = /^\+221\s(77|76|70|78|75)\s\d{3}\s\d{2}\s\d{2}$/;
    
    // Liste des opérateurs avec leurs préfixes
    const operators = {
      '77': 'Orange',
      '76': 'Free',
      '70': 'Expresso',
      '78': 'Orange',
      '75': 'Promobile'
    };

    const isValid = regex.test(value);
    if (!isValid) {
      return { invalidPhone: { value: control.value } };
    }

    // Vérification supplémentaire de l'opérateur
    const prefix = value.split(' ')[1];
    const operator = operators[prefix as keyof typeof operators] || 'Inconnu';
    
    // Vous pouvez stocker l'opérateur si besoin
    control.parent?.get('phoneOperator')?.setValue(operator, { emitEvent: false });

    return null;
  };
}