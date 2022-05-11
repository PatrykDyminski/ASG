import {Player} from './player'

export class EventASG {
  _id:{};
  organizator: {_id: string, imie: string};
  nazwa: string;
  termin: string;
  wsp: string;
  miejsce: string;
  oplata: number;
  rodzaj: string;
  limity: number[];
  roznica: number;
  frakcje: {strona: string, wielkosc: number, zapisani: Player[], otwarte: boolean}[];
  opis: string;

}

