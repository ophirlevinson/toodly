import { Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { MessageService } from './message.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class AuthService {

  constructor( public db: AngularFirestore, public afAuth: AngularFireAuth, public messageService : MessageService){ 
    this.getCurrentUser().then( user => {
      this.messageService.sendMessage({type:this.messageService.USER_LOGGED_IN, msg:this.getToken()})
    }).catch(err => {
      console.log(err)
    })
  }

  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doTwitterLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.TwitterAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doGoogleLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(res => {
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
          localStorage.setItem('token',idToken)
          this.messageService.sendMessage({type:this.messageService.USER_LOGGED_IN, msg:idToken})
        }).catch(function(error) {
          console.error(error)
        });
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogout(){
    return new Promise((resolve, reject) => {
      if(firebase.auth().currentUser){
        this.afAuth.auth.signOut();
        localStorage.removeItem('token');
        this.messageService.sendMessage({type:this.messageService.USER_LOGGED_OUT})
        resolve();
      }
      else{
        reject();
      }
    });
  }

  getToken(){
    let token = localStorage.getItem('token') || null
    return token;
  }

  getCurrentUser(){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().onAuthStateChanged((user) =>{
        if (user) {
          this.messageService.sendMessage({type:this.messageService.USER_CURRENT_USER, msg:user})
          resolve(user);
        } else {
          reject('No user logged in');
        }
      })
    })
  }

  updateCurrentUser(value){
    return new Promise<any>((resolve, reject) => {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: value.name,
        photoURL: user.photoURL
      }).then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }


}