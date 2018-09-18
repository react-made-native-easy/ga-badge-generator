const functions = require('firebase-functions');
const { google } = require('googleapis');
const creds = require('./credentials.json');

const START_DATE = '2017-12-01';

const getUsers = (key, viewId) => {
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'],
    null,
  );

  return new Promise((resolve, reject) => {
    jwtClient.authorize((error) => {
      if (error) {
        return reject(error);
      }
      const analytics = google.analyticsreporting('v4');
      const options = {
        auth: jwtClient,
        resource: {
          reportRequests: [
            {
              viewId,
              dateRanges: [{ startDate: START_DATE, endDate: 'today' }],
              metrics: [{ expression: 'ga:pageviews' }],
            },
          ],
        },
      };
      analytics.reports.batchGet(options, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  });
};

exports.helloWorld = functions.https.onRequest(async (response) => {
  const viewId = '166250965';
  const data = await getUsers(creds, viewId);
  return response.json(data);
});
