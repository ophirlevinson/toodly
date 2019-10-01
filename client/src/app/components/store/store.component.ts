import { Component, OnInit, HostListener, ViewChildren,QueryList, ElementRef } from '@angular/core';
import { PurchaseService } from 'src/app/services/purchase.service';
import { MessageService } from 'src/app/services/message.service';
import { ActivatedRoute } from '@angular/router';





@Component({
  selector: 'app-cards',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})



export class StoreComponent implements OnInit {
 
  products : Products[];

  displayShop : boolean = false;

  constructor(private route: ActivatedRoute, private purchaseService: PurchaseService, private messageService: MessageService) { }
  
  ngOnInit() {
    
    this.purchaseService.getProducts()
    .subscribe(( products ) => {
        console.log(products)
        this.products = (products && (products['result'] == 'ok')) ? products['data'] : null
        if (this.products){
          this.displayShop = true
          this.products[0]['active'] = true
          
        }
      });
  }


  addCart(name) {
    let product = this.products.filter( (product) => {return product['name'] == name} )[0];
    this.messageService.sendMessage({type:this.messageService.ADD_TO_CART, msg:product});
  }

  activateClass(subModule){
    this.products.forEach ( product  => {
      product['active'] = false
    })
    subModule.active = !subModule.active;    
  }
  
 

}






