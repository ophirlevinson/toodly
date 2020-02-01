import { Component, OnInit } from '@angular/core';
import { PurchaseService } from 'src/app/services/purchase.service';
import { MessageService } from 'src/app/services/message.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, query, stagger  } from '@angular/animations';

const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter',
      [style({ opacity: 0 }), stagger('60ms', animate('300ms ease-out', style({ opacity: 1 ,transform: 'translate(0px,0px)'})))],
      { optional: true }
    ),
    query(':leave',
      
      animate('300ms', style({ opacity: 0,transform: 'translate(100%,0px)' })),
      { optional: true }
      
    )
    
  ])
]);

declare var UIkit: any;


@Component({
  selector: 'app-cards',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'] ,
  animations: [listAnimation]
})



export class StoreComponent implements OnInit {
 
  products : Products[];
  product : {} //{name:string,description:string,imgURLs:[],price:number,tags_array:[]};
  tags : string[];

  tagIndex : number = 0;
  filteredProducts : Products[]
  displayShop : boolean = false;

  constructor(private route: ActivatedRoute, private purchaseService: PurchaseService, private messageService: MessageService) { }
  
  ngOnInit() {
    this.product = {name:'',description:'',imgURLs:[],price:0,tags_array:[]}
    if (localStorage.getItem('products')) {
      this.products = JSON.parse(localStorage.getItem('products'));
      this.filteredProducts = this.products
      this.tags = this.extractTags()
      this.products[0]['active'] = true;
      
      this.displayShop = true;
  
    } else {
      this.purchaseService.getProducts()
      .subscribe(( products ) => {
          // console.log(products);
          
          this.products = (products && (products['result'] == 'ok')) ? products['data'] : null
          if (this.products){
            this.filteredProducts = this.products
            this.tags = this.extractTags()
            this.products[0]['active'] = true;
            localStorage.setItem('products', JSON.stringify(this.products));
            this.displayShop = true;
            
          }
        });
    }
  }

  onFilterByTag(tag) {
    this.tagIndex = this.tags.indexOf(tag)
    if (tag == 'הכל') {
      this.filteredProducts = this.products
    } else {
      this.filteredProducts = this.products.filter ( product => product['tags'].includes(tag))
    }
    
  }

  extractTags():string[] {
    let tags = ['הכל'];
    this.products.forEach(product => {
      if (product['tags']) {
        // extract all product tags
        let productTags = product['tags'].split(',')
        for (let i=0; i<productTags.length;i++) {

        }
        productTags.forEach( productTag => {
          if (!tags.includes(productTag)) {
            tags.push(productTag)
          }
        })
      }
      
    })
    // console.log(tags)
    return tags
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

  onProductMoreInfo(index) {
    this.product = this.filteredProducts[index];
    let tags = this.product['tags'].split(',')
    let tagsarray = tags.map( tag => '#'+tag)
    this.product['tags_array'] = tagsarray
    console.log(this.product)
    UIkit.modal("#modal-product").show()
  }



  onHide() {
    UIkit.modal("#modal-product").hide()
  }

  
  
 

}






