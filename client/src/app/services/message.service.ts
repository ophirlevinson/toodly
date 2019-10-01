import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class MessageService {

    ADD_TO_CART='add_to_cart';
    USER_LOGGED_IN = 'User_logged_in'
    USER_LOGGED_OUT = 'User_logged_out'
    USER_CURRENT_USER = 'User_current_user'
    LOGIN_SUCCESSFUL = 'Login successful'
    STARTLOGIN = 'Start login'
    CHANGE_LOGIN_MODE = 'Change_login_mode'
    REGISTER_SUCCESSFUL = "Register_successful"
    
    private subject = new Subject<any>();

    sendMessage(message) {
        this.subject.next(message);
    }

    clearMessages() {
        this.subject.next();
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}