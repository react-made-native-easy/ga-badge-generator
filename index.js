const { google } = require("googleapis");
const result = require("lodash.result");
const redirect = require("micro-redirect");
const url = require("url");
const atob = require("atob");

const START_DATE = "2017-12-01";

const gaServiceAccount = {
  type: "service_account",
  project_id: "rnbook-analytics",
  client_id: process.env.GA_CLIENT_ID,
  private_key_id: process.env.GA_PRIVATE_KEY_ID,
  private_key: atob(process.env.GA_PRIVATE_KEY),
  client_email: "analyticsbot@rnbook-analytics.iam.gserviceaccount.com",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/analyticsbot%40rnbook-analytics.iam.gserviceaccount.com",
};

const getGAMetricsRawData = async (key, viewId) => {
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ["https://www.googleapis.com/auth/analytics.readonly"],
    null
  );

  return new Promise((resolve, reject) => {
    jwtClient.authorize((error) => {
      if (error) {
        return reject(error);
      }
      const analytics = google.analyticsreporting("v4");
      const options = {
        auth: jwtClient,
        resource: {
          reportRequests: [
            {
              viewId,
              dateRanges: [{ startDate: START_DATE, endDate: "today" }],
              metrics: [
                { expression: "ga:pageviews" },
                { expression: "ga:users" },
              ],
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

const extractMetrics = (raw) => {
  const gaMetrics = result(
    raw,
    "data.reports[0].data.rows[0].metrics[0].values",
    []
  );
  const [pageviews, users] = gaMetrics;
  return { pageviews, users };
};

const getAnalytics = async () => {
  const viewId = "166250965";
  const data = await getGAMetricsRawData(gaServiceAccount, viewId);
  return extractMetrics(data);
};

const generateUrl = (title, value, color) =>
  `https://img.shields.io/badge/${title}-${value}-${color}.svg`;

const getRoute = (urlstring) => {
  const { pathname } = url.parse(urlstring, true);
  return pathname;
};

module.exports = async (req, res) => {
  const { pageviews, users } = await getAnalytics();
  const route = getRoute(req.url);

  let location = null;
  if (route === "/pageviews") {
    location = generateUrl("Page Views", pageviews, "blue");
  } else if (route === "/users") {
    location = generateUrl("Users", users, "green");
  } else {
    location = generateUrl("404", "not found", "red");
  }
  const statusCode = 302;
  redirect(res, statusCode, location);
};
