import { Injectable } from "@angular/core";
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { MessageService } from './message.service';

@Injectable()
export class UserService {
  
  

  constructor(
   public db: AngularFirestore,
   public afAuth: AngularFireAuth,
   public messageService : MessageService
 ){
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