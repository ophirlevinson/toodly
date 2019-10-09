import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'src/app/services/message.service';
import { Subscription } from 'rxjs';
import { PurchaseService } from 'src/app/services/purchase.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-home',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  
  subscription:Subscription
  msgForm: FormGroup;
  errorMessage:string;
  disableForm : boolean = false

  constructor(private fb: FormBuilder,private messageService: MessageService,private purchaseService: PurchaseService) { 
    this.createForm();

    this.subscription = this.messageService.getMessage().subscribe(message => {
    
      switch(message.type) {
        case this.messageService.RECAPTCHA_SUCCESS : {
          if (message.for == 'about') {
            this.disableForm = false ; break};
          }
        case this.messageService.RECAPTCHA_FAILURE : {
          if (message.for == 'about') {
            this.disableForm = false ;
            this.errorMessage='משהו באימות השתבש'; break};
          }
      }
    })
  }

  ngOnInit() {
 
  }
  onSubmit(value) {
    if (!this.disableForm) {
      this.purchaseService.sendMessage({email:value.email, message:value.message})
      .subscribe(( result ) => {
        console.log(result)
      })
    };
  }

  createForm() {
    this.msgForm = this.fb.group({
      name: ['',Validators.required],
      email: ['', [Validators.required ,ValidationService.emailValidator]],
      message: ['',Validators.required]
    });
  }
}
