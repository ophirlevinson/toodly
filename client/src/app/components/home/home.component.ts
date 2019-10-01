import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.get("login") === 'login') {
        this.messageService.sendMessage({type:this.messageService.STARTLOGIN})
      }
 
    })
  }

}
