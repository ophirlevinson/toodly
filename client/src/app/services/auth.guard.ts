import { Injectable } from '@angular/core';
import { CanActivate, Router } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public afAuth: AngularFireAuth,
    public authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this.authService.getCurrentUser()
      .then(user => {
        return resolve(true);
      }, err => {
          this.router.navigate(['/home/login']);
          console.log('AUTHGUARD : no user found')
        return resolve(false);
      })
    })
  }
}