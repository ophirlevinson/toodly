import { Injectable }             from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { Observable, of, EMPTY }  from 'rxjs';
import { PurchaseService } from './purchase.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsResolverService implements Resolve<Products> {
  constructor(private purchseService:PurchaseService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Products> | Observable<never> {
    return this.purchseService.getProducts().pipe() as Observable<Products>
    /*.subscribe(( products ) => {
        console.log(products)
        return of(products) as Observable<Products>
    })*/
  }
}