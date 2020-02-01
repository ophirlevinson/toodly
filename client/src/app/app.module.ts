import { AuthGuard } from './services/auth.guard';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS  } from '@angular/common/http';
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
import { OrdersComponent } from './components/orders/orders.component';
import { ReCaptchaDirective } from './components/recaptcha/recaptcha.component';

import { ReactiveFormsModule } from '@angular/forms'
import { UserResolver } from './components/user/user.resolver';
import { AuthService } from './services/auth.service';
import { TokenInterceptor } from './services/token.interceptor';
import { AboutComponent } from './components/about/about.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { WavingComponent } from './components/waving/waving.component';


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
    AboutComponent,
    ProjectsComponent,
    OrdersComponent,
    WavingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
    ReactiveFormsModule,
  ],
  providers: [AuthGuard, AuthService, UserResolver,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
