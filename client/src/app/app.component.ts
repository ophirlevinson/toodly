import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from './services/message.service';
import { PurchaseService } from './services/purchase.service';
import { Router, Event, ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

// import 'p5';

declare var UIkit: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent {



  messages: any[] = [];
  subscription: Subscription;
  user: Subscription = null;
  cartItems : Item[] = [];
  timeLeft: number = 2;
  blink:boolean = false;
  interval
  bodyEl:Object;
  inLoginMode:boolean = true;

  
  constructor(private route: ActivatedRoute, private el: ElementRef, private router:Router, private purchaseService:PurchaseService,  private messageService: MessageService, public authService:AuthService, private userService: UserService ) {
    router.events.subscribe((event: Event) => { 
      UIkit.offcanvas('#offcanvas-nav-primary').hide() 
    })
    this.bodyEl = this.el.nativeElement.closest('body');
    this.startTimer()
    this.userService.getCurrentUser().then( (res) => {console.log(res)}).catch ( function(err) {console.log(err)});
    
    
    // subscribe to messages
    this.subscription = this.messageService.getMessage().subscribe(message => {
      if (message) {
        switch(message.type) {
          case this.messageService.ADD_TO_CART : {this.addToCart(message.msg); break};
          case this.messageService.USER_LOGGED_IN : {this.user = message.msg; break};
          case this.messageService.USER_CURRENT_USER : {this.user = message.msg; break};
          case this.messageService.USER_LOGGED_OUT : {
            this.user = null;
            UIkit.notification({pos:'top-center',timeout:1000,message: '<div style="text-align:center;font-size:1rem"><span uk-icon="icon: check"></span>תודה שביקרתם אצלנו!</div>'})
            UIkit.offcanvas('#offcanvas-nav-primary').hide() 
            this.router.navigate(['/home']);
            break;
          }
          case this.messageService.LOGIN_SUCCESSFUL : {
            UIkit.notification({pos:'top-center',timeout:1000,message: '<div style="text-align:center;font-size:1rem"><span uk-icon="icon: check"></span>ברוכים הבאים לטודלי - משחקים עם השראה</div>'})
            UIkit.modal('#login').hide()
            break;
          }
          case this.messageService.STARTLOGIN : {UIkit.modal('#login').show(); break}
          case this.messageService.CHANGE_LOGIN_MODE : {this.inLoginMode = message.msg; break}
          case this.messageService.REGISTER_SUCCESSFUL : {
            UIkit.notification({pos:'top-center',timeout:1000,message: '<div style="text-align:center;font-size:1rem"><span uk-icon="icon: check"></span>הרישום בוצע בהצלחה!</div>'})
            UIkit.notification({pos:'top-center',timeout:1000,message: '<div style="text-align:center;font-size:1rem"><span uk-icon="icon: check"></span>ברוכים הבאים לטודלי - משחקים עם השראה</div>'})
            UIkit.modal('#login').hide();
          }
        }
        
 
        
      } else {
        // clear messages when empty message received
        this.messages = [];
      }
    });

    
  }

  ngOnInit() {
    
  }

  addToCart(item) {
    let cart_item = item;
    let newItem = true;
    this.cartItems.forEach(  (item, i) => {
      if (item['name'] == cart_item.name) {
        newItem = false;
        if (item.quantity < item['limit']) {
          this.cartItems[i].quantity ++; 
          UIkit.notification({pos:'top-center',timeout:1000,message: '<div style="text-align:center;font-size:1rem">הוספנו עוד מהפריט לעגלת הקניות</div>'})
        } else {
          UIkit.notification({pos:'top-center',timeout:1500,message: '<div style="text-align:center;font-size:1rem">הגעתם למגבלת הכמות לפריט זה</div>'})
        }
      }
    })
    if (newItem) {
      cart_item.quantity = 1;
      this.cartItems.push(cart_item) 
      UIkit.notification({pos:'top-center',timeout:1000,message: '<div style="text-align:center;font-size:1rem">הפריט התווסף לעגלת הקניות <span uk-icon="icon: check"></span></div>'})
      
    }
  }

  getTotal() {
    let total = 0
    this.cartItems.forEach (item => {
      total += item['price'] * item.quantity
    })
    return total
  }

  getQuantity() {
    let quantity = 0
    this.cartItems.forEach (item => {
      quantity += item.quantity
    })
    return quantity  

  }

  removeItem(index){
    this.cartItems.splice(index,1);
    if (this.cartItems.length == 0) {
      UIkit.modal('#cart').toggle();
    }
  }

  toggle() {
    UIkit.modal('#cart').toggle();
  }

  pay() {
    this.purchaseService.pay(this.cartItems)
  }

  showLogin() {
    UIkit.modal('#login').show();
  }

  startTimer() {
    this.interval = setInterval(() => {  
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = Math.floor(Math.random() * 6);;  //seconds between blinks
        this.blink = true;
        
        this.bodyEl['style'].backgroundImage = "url('assets/images/cow1.svg')"
       
        
        setTimeout( () => {
          this.blink = false
          this.bodyEl['style'].backgroundImage = "url('assets/images/cow2.svg') , url('assets/images/cow1.svg')"
        },400)  //time of blink
        
      }
     
    },1000)
  }

}