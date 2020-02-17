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

const config = require('./config');
const helper = require('./helper.js');
const express = require('express');
const cors = require('cors');
const app = express();
const {Storage} = require('@google-cloud/storage')
const storage = new Storage();
const functions = require('firebase-functions');
const {Firestore} = require('@google-cloud/firestore');
const firestore = new Firestore();
const paypal = require('paypal-rest-sdk');
const bodyParser = require("body-parser");
const rp = require('request-promise');
const admin = require('firebase-admin');
admin.initializeApp();

// Automatically allow cross-origin requests

app.use(cors({ origin: true })); 
app.use(bodyParser.urlencoded({
  extended: true
}));

// paypal configurations
paypal.configure({
  mode: config().mode,
  client_id: config().client_id,//functions.config().paypal.client_id, // run: firebase functions:config:set paypal.client_id="yourPaypalClientID" 
  client_secret: config().client_secret  //functions.config().paypal.client_secret // run: firebase functions:config:set paypal.client_secret="yourPaypalClientSecret" 
});

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    
    res.status(403).send('Unauthorized to <a href="http://toodly.co">toodly.co</a>');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    let decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized to toodly.co');
    return;
  }
};

/**************************

Toodly API

***************************/

app.get("/", async (req, res) => {
  res.send(
    {result:"API for toodly.co, version 1.1"}
  )
})

/**************************

Get All projects

***************************/

app.get("/projects", async (req, res) => {
  let projects = []
  try {
    const  projectsCollection =  firestore.collection('projects').orderBy('order');
    let snapshot = await projectsCollection.get()
    snapshot.forEach(doc => {
      let data = doc.data();
      projects.push(data)
    });
    res.send({result:'ok', data:projects})
  }
  catch (error) {
    res.send({result:'error', data:'Could not retireive proejcts' + error})
  }
  
})

/**************************

sendMessage

***************************/
app.get("/sendmessage", async (req, res) => {
  let orders = []
  try {
    let message = JSON.parse(req.query.message)
    res.send({result:'ok',message:message})
    // helper.sendMessage(req.query.message)
  }
  catch (error) {
    res.send({result:'error', data:'Could not send message' + error})
  }
  
})
/**************************

Get All orders

***************************/

app.get("/orders",authenticate, async (req, res) => {
  let orders = []
  try {
    const  ordersCollection =  firestore.collection('orders').where('paid','==',true);
    let snapshot = await ordersCollection.get();
    snapshot.forEach(doc => {
      let data = doc.data();
      data.invoice_number = doc.id;
      orders.push(data)
    });
    
    res.send({result:'ok', data:orders})
  }
  catch (error) {
    res.send({result:'error', data:'Could not retireive data' + error})
  }
  
})

/**************************

checkRecaptcha

***************************/

app.get("/checkRecaptcha", async (req, res) => {
  const response = req.query.response
    console.log("recaptcha response", response)
    rp({
        uri: 'https://recaptcha.google.com/recaptcha/api/siteverify',
        method: 'POST', 
        formData: {
            secret: '6LfVn7sUAAAAAHNBrUYg67JGE_K5oDLOUB4r5qV7',
            response: response
        },
        json: true
    }).then(result => {
        console.log("recaptcha result", result)
        if (result.success) {
            res.send({result:'ok',data:"You're good to go, human."})
        }
        else {
            res.send({result:'fail',data:"Recaptcha verification failed. Are you a robot?"})
        }
    }).catch(reason => {
        console.log("Recaptcha request failure", reason)
        res.send({result:'fail',data:"Recaptcha request failed."})
    })
})


/**************************

Get All store products

***************************/

app.get("/products", async (req, res) => {
  console.log('opgie');
  let products = []
  try {
    const  productsCollection =  firestore.collection('products').orderBy('order', 'asc');;
    let snapshot = await productsCollection.get()
    snapshot.forEach(doc => {
      products.push(doc.data())
    });
    res.send({result:'ok', data:products})
  }
  catch (error) {
    res.send({result:'error', data:'Could not retireive data' + error})
  }
  
})

/**************************  
Pay
Initiate a payment
i.e.
// http://localhost:5001/toodlyco/us-central1/api/pay?products=[%7B%22name%22:%22%D7%9B%D7%A8%D7%98%D7%99%D7%A1%D7%99%D7%95%D7%AA%20%D7%9E%D7%A9%D7%97%D7%A7%D7%99%D7%9D%20%D7%91%D7%AA%D7%A0%D7%95%D7%A2%D7%94%22,%22quantity%22:1%7D,%7B%22name%22:%22%D7%9B%D7%A8%D7%98%D7%99%D7%A1%D7%99%D7%95%D7%AA%20%D7%90%D7%99%D7%9A%20%D7%A0%D7%A8%D7%92%D7%A2%D7%99%D7%9D%22,%22quantity%22:2%7D]
// http://localhost:5001/toodlyco/us-central1/api/pay?products=[%7B"id":1,"quantity":2%7D]
***************************/
app.get("/pay", async (req, res) => {
  
  
  // Extract products (ids & quantities)
  let products = JSON.parse(req.query.products)
  
  // Create invoice number
  let invoice_number = helper.randInvocie()

  // Get products details
  let products_details = [];
  let amount = {total:0 , currency:config().currency}
  
  try {
    for (let i = 0; i < products.length; i++) {
      let product = products[i]
      
      let details
      const productsRef =  firestore.collection('products').where('name','==',product.name);
      let snapshot = await productsRef.get()
      snapshot.forEach(doc => {
         details = doc.data()
      });
      products_details.push({name: details.name, currency:config().currency, quantity:product.quantity, price:details.price})
      amount.total += parseInt(product.quantity) * parseInt(details.price)
    }
  }
  catch (error) {
    console.log(error) 
    res.send(
      {result:'error',data:'Could not get products details' + error}
    )
  }
  
  // Create a order record
  await firestore.doc('orders/'+invoice_number).set({
    products: products_details,
    paid: false,
    amount: amount,
    payer:{},
    downloadable:true,
    date: new Date()
  }).catch(error => {
    console.log(error)
    res.send(
      {result:'error',data:'Could not create a  order record'}
    )
  })

  // Set up a payment information object, Build PayPal payment request
  const payReq = JSON.stringify({
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: `${req.protocol}://${req.get('host')}`+config().base_url+`/api/process`,
      cancel_url: `${req.protocol}://${req.get('host')}`+config().base_url+`/api/cancel`
    },
    transactions: [{
      amount: amount,
      item_list : {items: products_details},
      invoice_number : invoice_number, 
    }]
  });


  // Initialize the payment and redirect the user.
  paypal.payment.create(payReq, (error, payment) => {
    const links = {};
    if (error) {
      console.log('payment create - error' +error)
      console.error(error.response.details)
      res.status('500').end();
    } else {

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


/**************************  

Process a payment
Complete the payment. Use the payer and payment IDs provided in the query string following the redirect
i.e.
http://localhost:5001/toodlyco/us-central1/api/process?paymentId=PAYID-LWDRJMY8L031122F59520301&token=EC-8R762643FA719680C&PayerID=9QQT2CGEUUVK2

***************************/

app.get("/process", async(req, res) => {
  const paymentId = req.query.paymentId;
  const payerId = {
    payer_id: req.query.PayerID
  };
  const r = await paypal.payment.execute(paymentId, payerId,async (error, payment) => {
    
    if (error) {
      console.error(error); 
      try {
        invoice_number = payment.transactions[0].invoice_number;
        res.redirect(config().errorURL+'/'+invoice_number); // replace with your url, page success
      }
      catch {
        res.redirect(config().successURL+'/'+error); // replace with your url, page success
      }
      
      
    } else {
      if (payment.state === 'approved') {
        let invoice_number = payment.transactions[0].invoice_number
        console.info('payment completed successfully, invoice-number: ', payment.transactions[0].invoice_number);
        // console.info('req.custom: : ', payment.transactions[0].custom);
        
        // Update order
        await firestore.doc('orders/'+invoice_number).update({
          paid: true,
          mailsent: false,
          paypalID: payment.id,
          payer:payment.payer,
          date: payment.create_time,
        }).catch(error => {
          console.error(error)
          res.send(
            {result:'error',data:'Could not update order record: '+invoice_number}
          )
        })
        
        // Send emails to client & admin

        let client_email_status = await helper.sendMailClient(payment)
        let admin_email_status = await helper.sendMailAdmin(payment)
        
        // Update sent mails
        // Update order
        if (client_email_status && admin_email_status) {
          await firestore.doc('orders/'+invoice_number).update({
            mailsent: true,
          }).catch(error => {
            console.error(error)
            res.send(
              {result:'error',data:'Could not update mail status on order: '+invoice_number}
            )
          })
        }

        res.redirect(config().successURL+'/'+invoice_number); // replace with your url, page success
        
      } else {
        console.warn('payment.state: not approved ?');
        // replace debug url
        res.send(
          {result:'error',data:'payment.state: not approved'}
        )
        // res.redirect(`https://console.firebase.google.com/project/${process.env.GCLOUD_PROJECT}/functions/logs?search=&severity=DEBUG`);
      }
    }
  });

});


/**************************  

Return order details
Complete the payment. Use the payer and payment IDs provided in the query string following the redirect
i.e.
http://localhost:5001/toodlyco/us-central1/api/order/details?invoice=2019092227227183078

***************************/
app.get("/order/details", async (req, res) => {

  // Get invoice parameter
  let invoice_number = req.query.invoice;
  const snapshot = await firestore.doc('orders/'+invoice_number).get()
  
  const order = snapshot.data()
  
  if (order && order.paid && order.downloadable) {
    
    var productSnapshots = []
    order.products.forEach( (product , index ) => {
      productSnapshots.push(firestore.collection('products').where('name','==',order.products[index].name).get());
    })
    // Try getting the file details
   
    try{
      var fileDetails = [];
      Promise.all(productSnapshots).then (values => {
        values.forEach ( (value , index) => {
          var product = value.docs.map(function (documentSnapshot) {
            return documentSnapshot.data();  
          });
          
          
          fileDetails.push({fname:product[0].fname, folder:product[0].folder});
       
        })

         // Try getting the file sizes
        const bucket = storage.bucket(config().storage.bucketName);
        var filesRefPromises = [];
        
        try {
          fileDetails.forEach( (file, index) => {
            var filesRef  = bucket.file('/'+file.folder+'/'+file.fname);
            
            filesRefPromises.push(filesRef.getMetadata());
          })      
          Promise.all(filesRefPromises).then (values => {    
            values.forEach ( (metadata , index) => {
             
              order.products[index].size = metadata[0].size
            });
            res.send({result:'ok', data:{payer: order.payer, products:order.products}});
          
          })

        }
        catch(err) {
          console.log({error:err})
          res.send({result:'error', data:'Could not retrieve files size'})
        }
      })
    }
    catch(err) {
      console.log({error:err})
      res.send({result:'error', data:'Could not get file details'})
    }

   
  
  } else {
    res.send({result:'error', data:'No details found'})
  }  
})
 

/**************************  

Download files
http://localhost:5001/toodlyco/us-central1/api/order/download?invoice=2019092227227183078&index=1

***************************/
app.get("/order/download", async (req, res) => {
  // Get parameters (invoice , payment product index)
  let invoice_number = req.query.invoice;
  let index = req.query.index;
  // Retrieve payment for this invoice
  let snapshot =  await firestore.doc('orders/'+invoice_number).get()
  let order = snapshot.data();

  let hasExceededDownloadTimes = false
  let downloadCount = order.products[index].downloadCount || 0
  // Check if user exceeded the amound of downloading times
  if (downloadCount >= config().products.downloadCount) {
    hasExceededDownloadTimes = true
  }
  
  console.log('hasExceededDownloadTimes = '+ hasExceededDownloadTimes)
  // Only if exceeded , check time frame
  /* if (hasExceededDownloadTimes) {
    let lastDownloadDate = order.products[index]['update_date'].toDate() 
    let now = new Date()
    console.log('Days since last update ' + (now - lastDownloadDate) / 86400000)
    // Check if time has elappsed since last download
    if ((now - lastDownloadDate) / 86400000 > config().products.daysleft) {
      console.log('download has expired')
      res.send(null)
      return 
    }
  } else {
    order.products[index]['update_date'] = new Date();
  } */
  let lastDownloadDate = new Date(order.date) 
  let now = new Date()
  if ((now - lastDownloadDate) / 86400000 > config().products.daysleft) {
    console.log('download has expired')
    res.send(null)
    
    return 
  }

  // Update order
  order.products[index]['lastdownloadedon'] = now;
  order.products[index].downloadCount = ++downloadCount;
  
  
  await firestore.doc('orders/'+invoice_number).update({
    products : order.products
  }).catch(error => {
    console.error(error)
    res.send(null)
    
  })
 
  
 
  // Find product ID in order to use its name
  const productSnapshot =  await (firestore.collection('products').where('name','==',order.products[index].name)).get()
  var product = productSnapshot.docs.map(function (documentSnapshot) {
    return documentSnapshot.data();
  });
  
  // console.log(product)
  try {
    const bucket = storage.bucket(config().storage.bucketName)
    const remoteFile  = bucket.file('/'+product[0].folder+'/'+product[0].fname);
    res.writeHead(200, {
        'Content-Type': 'appication/pdf',
        'responseType': 'blob',
        'Content-Disposition' : 'attachment; filename=' + product[0].fname 
    });
    
    remoteFile.createReadStream().pipe(res)  
  }
  catch(err) {
    console.log({error:err})
    res.send(null)
  }
  
 
  
  
  

})

// not as clean, but a better endpoint to consume
const api = functions.https.onRequest((req, res) => {
  return app(req, res)
})
module.exports = {
  api,
}





