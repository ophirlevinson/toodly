import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { PurchaseService } from 'src/app/services/purchase.service';
import * as FileSaver from 'file-saver';

declare var UIkit: any;

// http://localhost:4200/success?invoice=2019092227227183078
@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {

  invoice : string;
  payment : {};
  loaded : number = 0;
  results  : string ;
  index   : number = 0;
  downloadErr : boolean = false;
  

  constructor(private route: ActivatedRoute,private purchaseService: PurchaseService ) { }

  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.invoice = params.get("invoice")
      this.results = 'waiting';
    })
    
    this.purchaseService.getOrderDetails(this.invoice)
      .subscribe(( data ) => {
        
        if (data && data['result'] == 'ok'){
          this.payment = data['data']
          this.results = 'ok';
          // console.log(this.payment)
        }  else {
          this.results = 'error';
        }  
    });
  }

  onDownload(index) {
    this.index = index;
    this.loaded = 0;
    this.downloadErr = false;
    let modal = UIkit.modal('#modal-center', {modal: false, keyboard: false, bgclose: false, center: true}).show();
    this.purchaseService.download(this.invoice,index)
      .subscribe((result) => {
        // console.log(result);
        
        if (result == null) {
          this.downloadErr = true;
        } else {

        
          result['total'] = this.payment['products'][index].size;
          // console.log(result);
          if (result.type === HttpEventType.DownloadProgress) {
            this.loaded = Math.round( 100 * result.loaded / result.total);
            // console.log(this.loaded);
          
          }
          if (result.type === HttpEventType.Response) {
            if (result.body.size < 100) {
              this.downloadErr = true;
            } else {
              FileSaver.saveAs(result.body, this.payment['products'][index].name+'.pdf');
              UIkit.modal('#modal-center', {}).hide();
              
            }
           
            
            
          }
        }
    });
    
    
  }

  getProdName(index) {
    if (this.payment) {
      return this.payment['products'][index].name;
    } else {
      return '';
    }
    
  }

}
