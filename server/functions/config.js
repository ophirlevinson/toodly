var isLocal = true;

general_configurations= {
    mode: 'live', // sandbox or live
    client_id: "",
    client_secret: "",
    currency : 'ILS', 
    email : {
        service: 'gmail',
        auth: { 
            user: 'levinsonophir@gmail.com',
            pass: 'RedHead1979'
        }
    },
    products : {
        downloadCount : 2,
        daysleft : 2
    },
    storage : {
        bucketName : 'gs://toodlyco.appspot.com/'
    }

}

dev_configurations = {
    mode: 'sandbox', // sandbox or live
    base_url : '/toodlyco/us-central1/api',
    successURL : 'https://localhost:4200/success',
    errorURL : 'https://localhost:4200/error',
    downloadsURL : 'https://localhost:4200/downloads'
}

prod_configurations = {
    base_url : '',
    successURL : 'https://toodly.co/success',
    errorURL : 'https://toodly.co/error',
    downloadsURL : 'https://toodly.co/downloads'
}

config = function(){
    if (isLocal) {
        return {...dev_configurations, ...general_configurations };
    } else {
        return {...prod_configurations, ...general_configurations };
    }
}

module.exports = config;

