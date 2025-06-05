import { Component } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  imports: [],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
currentStep = 0;
  fieldsets: HTMLElement[] = [];

  ngOnInit() {
    this.fieldsets = Array.from(document.querySelectorAll('fieldset'));
    this.showStep(this.currentStep);
  }

  showStep(index: number) {
    this.fieldsets.forEach((fs, i) => fs.style.display = i === index ? 'block' : 'none');
    const progressItems = document.querySelectorAll('#progressbar li');
    progressItems.forEach((item, i) =>
      item.classList.toggle('active', i <= index)
    );
  }

  next() {
    if (this.currentStep < this.fieldsets.length - 1) {
      this.currentStep++;
      this.showStep(this.currentStep);
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }
}
