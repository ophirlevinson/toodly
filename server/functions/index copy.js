/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const express = require('express');
const cors = require('cors');
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));



const functions = require('firebase-functions');
const paypal = require('paypal-rest-sdk');
// firebase-admin SDK init
const admin = require('firebase-admin');
admin.initializeApp();
// Configure your environment
paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: "AXoChibKfn7WUC8BfugQZ6OPERgFtIxdSPbWUCvilXm2qL_e-nxuMHsNHyqk9vjzHRFBfl7bp-Apim7P",//functions.config().paypal.client_id, // run: firebase functions:config:set paypal.client_id="yourPaypalClientID"
  client_secret: "EGImH5xQuOPdtgcnpTrc89SBvzbp22tiiNcD1w00y9tX0CtK5wmzQWuyqArwgJaCWMYMLT4nVSjw5v_m"  //functions.config().paypal.client_secret // run: firebase functions:config:set paypal.client_secret="yourPaypalClientSecret"
});
 

// build multiple CRUD interfaces:
app.get("*", (request, response) => {
  response.send(
    "Hello from Express on Firebase with CORS! No trailing '/' required!"
  )
})


// not as clean, but a better endpoint to consume
const api = functions.https.onRequest((request, response) => {
  if (!request.path) {
    request.url = `/${request.url}` // prepend '/' to keep query params if any
  }
  return app(request, response)
})

module.exports = {
  api,
}





/**
 * Expected in the body the amount
 * Set up the payment information object
 * Initialize the payment and redirect the user to the PayPal payment page
 */
exports.pay = functions.https.onRequest((req, res) => {
  // 1.Set up a payment information object, Build PayPal payment request
  
  const payReq = JSON.stringify({
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: `${req.protocol}://${req.get('host')}/process`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`
    },
    transactions: [{
      amount: {
        total: 1, //req.body.price,
        currency: 'USD', 
        uid : 2343, 
      },
      // This is the payment transaction description. Maximum length: 127
      description: req.body.uid, // req.body.id
      // reference_id string .Optional. The merchant-provided ID for the purchase unit. Maximum length: 256.
      // reference_id: req.body.uid,
      custom: req.body.uid,
      // soft_descriptor: req.body.uid
      // "invoice_number": req.body.uid,A
    }]
  });
  // 2.Initialize the payment and redirect the user.
  paypal.payment.create(payReq, (error, payment) => {
    const links = {};
    if (error) {
      console.log('payment create - error')
      console.error(error);
      console.error(error.response.details)
      res.status('500').end();
    } else {
      // Capture HATEOAS links
      payment.links.forEach((linkObj) => {
        links[linkObj.rel] = {
          href: linkObj.href,
          method: linkObj.method
        };
      });
      // If redirect url present, redirect user
      if (links.hasOwnProperty('approval_url')) {
        // REDIRECT USER TO links['approval_url'].href
        console.info(links.approval_url.href);
        // res.json({"approval_url":links.approval_url.href});
        res.redirect(302, links.approval_url.href);
      } else {
        console.error('no redirect URI present');
        res.status('500').end();
      }
    }
  });
});

// 3.Complete the payment. Use the payer and payment IDs provided in the query string following the redirect.
// http://localhost:5000/process?paymentId=PAYID-LWC4WRY0G247454556621409&token=EC-59S963294K523045W&PayerID=9QQT2CGEUUVK2

exports.process = functions.https.onRequest(async (req, res) => {
  const paymentId = req.query.paymentId;
  const payerId = {
    payer_id: req.query.PayerID
  };
  const r = await paypal.payment.execute(paymentId, payerId, (error, payment) => {
    if (error) {
      console.error(error);
      
      res.redirect(`${req.protocol}://${req.get('host')}/error`); // replace with your url page error
    } else {
      if (payment.state === 'approved') {
        console.info('payment completed successfully, description: ', payment.transactions[0].description);
        // console.info('req.custom: : ', payment.transactions[0].custom);
        // set paid status to True in RealTime Database
        const date = Date.now();
        const uid = payment.transactions[0].description;
        const ref = admin.database().ref('users/' + uid + '/');
        ref.push({
          'paid': true,
          // 'description': description,
          'date': date
        })
        res.redirect(`${req.protocol}://${req.get('host')}/success`); // replace with your url, page success
      } else {
        console.warn('payment.state: not approved ?');
        // replace debug url
        res.redirect(`https://console.firebase.google.com/project/${process.env.GCLOUD_PROJECT}/functions/logs?search=&severity=DEBUG`);
      }
    }
  });
  console.info('promise: ', r);
});
