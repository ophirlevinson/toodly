import { Directive, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

// https://firebase.googleblog.com/2017/08/guard-your-web-content-from-abuse-with.html
// https://netbasal.com/how-to-integrate-recaptcha-in-your-angular-forms-400c43344d5c
@Directive({
  selector: 'app-recaptcha',
})


export class ReCaptchaDirective implements OnInit {
    config  :  {};
    bodyEl:Object;
    widgetId : number;
    subscription : Subscription

    
constructor( private messageService:MessageService, private element : ElementRef ,private http: HttpClient){
    this.subscription = this.messageService.getMessage().subscribe(message => {
        switch(message.type) {
          case this.messageService.USER_LOGGED_OUT : {grecaptcha.reset(); break};
          
        }
      })
}
    ngOnInit() {
        this.registerReCaptchaCallback();
        this.addScript();
    }

   
    private render( element : HTMLElement, config ) : number {
        return grecaptcha.render(element, config);
    }

    registerReCaptchaCallback() {
        window.reCaptchaLoad = () => {
            const config = {
                'sitekey': '6LfVn7sUAAAAAMg214hoTRKTI5us4t2sswC7_ZYb',
                'callback': this.onSuccess.bind(this),
                'expired-callback': this.onExpired.bind(this)
            };
            
            this.widgetId = this.render(this.element.nativeElement, config);
        };
    }

    addScript() {
        let script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?onload=reCaptchaLoad`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }

    onSuccess(response) {
        this.http.get(environment.serverURL + '/checkRecaptcha?response='+response).subscribe(( result ) => {
            console.log(result)
            if (result && result['result'] === 'ok') {
                this.messageService.sendMessage({type:this.messageService.RECAPTCHA_SUCCESS})
            } else {
                this.onExpired()
            }
            
        })
        
    }

    onExpired() {
        this.messageService.sendMessage({type:this.messageService.RECAPTCHA_FAILURE})
    }

}

declare global {
    interface Window {
        grecaptcha : any;
        reCaptchaLoad : () => void
    }
}

declare const grecaptcha : any;


