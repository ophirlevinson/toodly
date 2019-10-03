
const nodemailer = require('nodemailer');
const config = require('./config');

/**
* Here we're using Gmail to send 
*/
let transporter = nodemailer.createTransport({
    service: config().email.service,
    auth: config().email.auth,
    host: 'smtp.gmail.com',
    port: 587,
    // secure: false,
    // requireTLS: true,
});

function f(n) { return n < 10 ? '0' + n : n; } 
function randInvoice(){
    var random_num = Math.floor(Math.random() * (99999999999 -  10000000000)) + 10000000000;
    var d = new Date();
    random_num = d.getFullYear() + f(d.getMonth()+1) + f(d.getDate()) + random_num; 
    return random_num
} 


async function sendMailClient (payment){ 
    const mailOptions = {
        from: 'טודלי - משחקים עם השראה <no-reply@toodly.co>', // Something like: Jane Doe <janedoe@gmail.com>
        to: payment.payer.payer_info.email,
        subject: 'רכישה מאתר טודלי - משחקים עם השראה', // email subject
        attachments: [
           {
                filename: 'logo.png',
                path: 'https://firebasestorage.googleapis.com/v0/b/toodlyco.appspot.com/o/web%2Flogo.png?alt=media&token=8d50367e-4a82-4844-9880-209e4892f1e0',
                cid: 'toodly-logo@cid'
           } 
        ],
        html: `
        <div style=";text-decoration-style:initial;text-decoration-color:initial;font-size:1.3em;font-family:&quot;Open Sans Hebrew&quot;,serif;direction:rtl">
            <h2 style="margin:0px"><span style="color:rgb(255,127,42)">תודה שקניתם אצלנו!</span></h2>
            <p style="margin:0px">בטודלי אנו יוצרים חוויות ותכנים פורצי דרך בעולם החינוך,</p>
            <p style="margin:0px">אנו מזמינים אתכם לעקוב אחרי פעילותינו  <a href="https://www.facebook.com/toodlygames">בדף הפייסבוק שלנו</a>.</p>
            <p style="margin:0px">מספר ההזמנה שלכם לבירורים הינו: <span>`+payment.transactions[0].invoice_number+`</span>.</p>
            <p style="margin:0px">על מנת להוריד את המוצרים שהזמנתם ליחצו על <a href="`+config().downloadsURL + '/'+payment.transactions[0].invoice_number +`">הקישור הזה.</a></p>
            <p style="margin:0px">שימו לב, הקישור תקף <strong>ליומיים בלבד</strong>.</p>
            <p style="margin:0px">בכל שאלה, בקשה או תמיכה טכנית נשמח לעזור,</p>
            <p style="margin:0px">בכבוד רב,</p>
            <p style="margin:0px">צוות טודלי - משחקים עם השראה</p>
            <div><img src="cid:toodly-logo@cid" alt="img" width="150" /></div>
            <a href="https://toodly.co">www.toodly.co</a>
        ` // email content in HTML
    };
    try {
        result = await transporter.sendMail(mailOptions)
        console.log(result)
        return true
    }
    catch (error) {
        return error
    }
}



function itemList(items) {
    let list = '';
    items.forEach( item => {            
        list += `<li>` + item.name + ` מחיר: ` + item.price + ` ,כמות: ` + item.quantity +`</li>`
    })
    return list;

}

async function sendMailAdmin (payment){  //transactions[0]
    
    const mailOptions = {
        from: 'Toodly - Games to inspire', // Something like: Jane Doe <janedoe@gmail.com>
        to: config().email.auth.user,
        subject: 'בוצעה רכישה מאתר טודלי', // email subject
        attachments: [
           {
                filename: 'logo.png',
                path: 'https://firebasestorage.googleapis.com/v0/b/toodlyco.appspot.com/o/web%2Flogo.png?alt=media&token=8d50367e-4a82-4844-9880-209e4892f1e0',
                cid: 'toodly-logo@cid'
           } 
        ],
        html: `
        <div style=";text-decoration-style:initial;text-decoration-color:initial;font-size:1.3em;font-family:&quot;Open Sans Hebrew&quot;,serif;direction:rtl">
            <h2 style="margin:0px"><span>בוצעה רכישה מאתר טודלי - משחקים עם השראה</span></h2>
            <p style="margin:0px">פרטי הרוכש:</p>
            <ul>
                <li>תאריך: <span>`+payment.create_time+`</span></p>
                <li>מספר חשבונית: <span>`+payment.transactions[0].invoice_number+`</span></p>
                <li>כתובת קונה: <span>`+payment.payer.payer_info.email+`</span></p>
                <li>שם : <span>`+payment.payer.payer_info.first_name + ` ` + payment.payer.payer_info.last_name +`</span></p>
                <li>טלפון: <span>`+payment.payer.payer_info.phone+`</span></p>
                <li>פייפאל: <span>`+payment.id+`</span></p>
            </ul>
            <p style="margin:0px">פרטי הרכישה:</p>
            <ul>
                `+ itemList(payment.transactions[0].item_list.items)
                +`
            </ul>
            <div><img src="cid:toodly-logo@cid" alt="img" width="150" /></div>
            <a href="https://toodly.co">www.toodly.co</a>
        ` // email content in HTML
    };
 

    try {
        result = await transporter.sendMail(mailOptions)
        return true
    }
    catch (error) {
        return error
    }
}

module.exports.randInvocie = randInvoice;
module.exports.sendMailClient = sendMailClient;
module.exports.sendMailAdmin = sendMailAdmin;


