import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  constructor(private route: ActivatedRoute,private router: Router, private messageService: MessageService,private analytics: AngularFireAnalytics) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.get("login") === 'login') {
        this.messageService.sendMessage({type:this.messageService.STARTLOGIN})
      }
      
 
    })
  }

  routeTo(routeTo) {
    this.analytics.logEvent('home_main_link_press');

    this.router.navigateByUrl(routeTo);
  }

}
