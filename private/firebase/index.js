'use strict';

module.exports = (app) => {

  require('paint-console');

  const path     = require('path');
  const firebase = require('firebase');
  const fs       = require('fs');

  const creditentialsPath = 'firebase.creditentials.json';
  const where             = `inside project root: '${creditentialsPath}'`;

  const errorMessage = `
    You should put your firebase creditentials from json:
    https://firebase.google.com/docs/auth/web/custom-auth#before-you-begin
    ${where}
  `;

  const successMessage = `
    Success: Initialized firebase.
    Found firebase creditentials
    ${where}
  `;

  let initFirebase = () => {

    const creditentials = require(path.join(__dirname, '..', '..', creditentialsPath));

    firebase.initializeApp({
      serviceAccount: creditentialsPath,
      databaseURL: `https://${creditentials.project_id}.firebaseio.com`,
    });

    const database = firebase.database();

    console.info(successMessage);

  };

  fs.exists(creditentialsPath, (exists) => {
      if (exists) {
        initFirebase();
      } else {
        console.error(errorMessage);        
      }
  });

};
