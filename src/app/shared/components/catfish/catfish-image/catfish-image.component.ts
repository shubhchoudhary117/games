import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-catfish-image',
  standalone: true,
  imports: [NgClass],
  templateUrl: './catfish-image.component.html',
  styleUrl: './catfish-image.component.scss'
})
export class CatfishImageComponent {

  @Input() img!: string;
  @Input() swepNumber!: number;
  @Input() isCatfished!: boolean;
  @Input() index!: number;
}
