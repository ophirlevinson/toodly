
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  constructor(private http: HttpClient) { }

  /** POST: make an order */
  order (item: String) {
      console.log('purchaseSerivce : order')
      return this.http.post('localhost:5000/pay', {item:3})
  }

  getOrderDetails (invoice: String) {
    console.log(environment.serverURL)
    return this.http.get(environment.serverURL + '/order/details?invoice='+invoice)
  }

  getOrders () {
    return this.http.get(environment.serverURL + '/orders')
  }

  getProjects () {
    return this.http.get(environment.serverURL + '/projects')
  }


  download (invoice: String, index:number) {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    return this.http.get(environment.serverURL + '/order/download/?invoice='+invoice+'&index='+index, { headers: headers, responseType: 'blob' })
  }

  getProducts (){
    return this.http.get(environment.serverURL + '/products')
  }

  pay(cartItems) {
    cartItems = cartItems.map( function(cart){ return {'name':cart.name, 'quantity':cart.quantity}})
    let url = environment.serverURL + '/pay?products='+JSON.stringify(cartItems)
    window.open(url, '_blank');
  }

  sendMessage(message) {
    console.log(message)
    return this.http.get(environment.serverURL + '/sendmessage' + JSON.stringify(message))
  }

  /*
  getHeader(){
  let token = localstorage.getItem('token')? localstorage.getItem('token') : null;
  return new HttpHeaders (
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'token': token
    }
  );
}
*/
   

  
}