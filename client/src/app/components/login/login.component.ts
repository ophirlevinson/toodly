import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'src/app/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  inLoginMode: boolean = true;
  subscription : Subscription;
  disableForm : boolean = true;

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
   
  ) {
    this.createForm();
    this.subscription = this.messageService.getMessage().subscribe(message => {
      switch(message.type) {
        case this.messageService.RECAPTCHA_SUCCESS : {this.disableForm = false ; break};
        case this.messageService.RECAPTCHA_FAILURE : {this.disableForm = false ;this.errorMessage='משהו באימות השתבש'; break};
        case this.messageService.USER_LOGGED_OUT : {this.disableForm = true; break};
        
      }
    })
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required ],
      password: ['',Validators.required]
    });
  }

  tryFacebookLogin(){
    this.authService.doFacebookLogin()
    .then(res => {
      this.router.navigate(['/user']);
    })
  }

  tryTwitterLogin(){
    this.authService.doTwitterLogin()
    .then(res => {
      this.router.navigate(['/user']);
    })
  }

  tryGoogleLogin(){
    this.authService.doGoogleLogin()
    .then(res => {
      this.router.navigate(['/user']);
    })
  }

  tryLogin(value){
    this.authService.doLogin(value)
    .then(res => {
      this.messageService.sendMessage({type:this.messageService.LOGIN_SUCCESSFUL})
    }, err => {
      console.log(err);
      this.errorMessage = 'הכניסה נכשלה, אנא בידקו שם משתמש או סיסמה';
    })
  }

  tryRegister(value){
    this.authService.doRegister(value)
    .then(res => {
      console.log(res);
      this.errorMessage = "";
      this.successMessage = "הרישום בוצע בהצלחה";
      this.messageService.sendMessage(this.messageService.REGISTER_SUCCESSFUL)
    }, err => {
      console.log(err);
      if (err.code === 'auth/weak-password') {
        this.errorMessage = 'על הסיסמה להכיל לפחות 6 תווים';
      } else {
        this.errorMessage = 'הרישום נכשל. ייתכן ושם המשתמש או הסיסמה כבר קיימים.';
      }
      // this.errorMessage = err.message;
      
      this.successMessage = "";
    })
  }

  tryLoginOrRegister(value) {
    if ((!this.inLoginMode && !this.disableForm) || this.inLoginMode) {
      this.inLoginMode ? this.tryLogin(value) : this.tryRegister(value)
    }
    
  }

  changeLoginMode() {
    this.inLoginMode = !this.inLoginMode;
    this.messageService.sendMessage({type:this.messageService.CHANGE_LOGIN_MODE, msg:this.inLoginMode})
  }

}