import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseService } from 'src/app/services/purchase.service';

@Component({
  selector: 'page-login',
  templateUrl: 'orders.component.html',
  styleUrls: ['orders.component.css']
})
export class OrdersComponent {

  orders : [];

  constructor(private router: Router,private purchaseService: PurchaseService){

  }

  ngOnInit() {
    
    this.purchaseService.getOrders()
      .subscribe(( orders ) => {
        console.log(orders)
        if (orders && orders['result'] == 'ok'){
          this.orders = orders['data']
          console.log(this.orders)
        }  else {
        }  
    });
  }
  sendEmail() {

  }

  goToDownloadPage(invoice_number){
    this.router.navigate(['/success/' + invoice_number]);
  }


}