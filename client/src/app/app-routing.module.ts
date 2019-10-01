import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { SuccessComponent } from './components/success/success.component';
import { StoreComponent } from './components/store/store.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { ProductsComponent } from './components/products/products.component';


const routes: Routes = [
  { path: '',component: HomeComponent },

  { path: 'home', component: HomeComponent },
  { path: 'home/:login', component: HomeComponent },
  { path: 'store', component: StoreComponent,
    /*resolve: {
      products: ProductsResolverService
    }*/
  },
  { path: 'success/:invoice', component: SuccessComponent },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent },

 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
