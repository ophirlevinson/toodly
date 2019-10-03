import { AuthGuard } from './services/auth.guard';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SuccessComponent } from './components/success/success.component';
import { StoreComponent } from './components/store/store.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { ProductsComponent } from './components/products/products.component';
import { ReCaptchaDirective } from './components/recaptcha/recaptcha.component';

import { ReactiveFormsModule } from '@angular/forms'
import { UserResolver } from './components/user/user.resolver';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';


@NgModule({
  declarations: [
    AppComponent,
    SuccessComponent,
    StoreComponent,
    ReCaptchaDirective,
    PageNotFoundComponent,
    HomeComponent, 
    LoginComponent, 
    UserComponent, 
    ProductsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    ReactiveFormsModule,
  ],
  providers: [AuthGuard, AuthService, UserService, UserResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
