import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './user.service';



@Injectable()
/*export class AuthGuard implements CanActivate {
    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
      console.log('AuthGuard#canActivate called');
      return true;
    }
  }*/
export class AuthGuard implements CanActivate {

  constructor(
    public afAuth: AngularFireAuth,
    public userService: UserService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean>{
    return new Promise((resolve, reject) => {
      this.userService.getCurrentUser()
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