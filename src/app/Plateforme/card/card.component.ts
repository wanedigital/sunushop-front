import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-seller-cards',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {



  ngOnInit() {}

  toggleCard(event: Event, element: HTMLElement) {
  event.preventDefault();
  const cardsContainer = document.querySelector('.cards');
  const isShowing = element.classList.contains('show');

  document.querySelectorAll('.card.show').forEach(el => el.classList.remove('show'));

  if (!isShowing) {
    cardsContainer?.classList.add('showing');
    element.classList.add('show');
  } else {
    cardsContainer?.classList.remove('showing');
  }
}

}
