// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  serverURL: "http://localhost:5001/toodlyco/us-central1/api",
  firebase: {
    apiKey: "AIzaSyBRR2eqsaCIuEkIcDQkJca1iKva_Y8jrec",
    authDomain: "toodlyco.firebaseapp.com",
    databaseURL: "https://toodlyco.firebaseio.com",
    projectId: "toodlyco",
    storageBucket: "toodlyco.appspot.com",
    messagingSenderId: "176360449015",
    appId: "1:176360449015:web:98c1c332d2263ce6f784f2"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
