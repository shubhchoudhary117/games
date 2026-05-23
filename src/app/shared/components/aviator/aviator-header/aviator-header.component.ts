import { Component } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-aviator-header',
  standalone: true,
  imports: [],
  templateUrl: './aviator-header.component.html',
  styleUrl: './aviator-header.component.scss'
})
export class AviatorHeaderComponent {

  constructor(private sidebarService:SidebarService){}

 
  openSidebar(){
    this.sidebarService.toggleSidebar();
  }

}
