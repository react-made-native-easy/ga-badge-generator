# GA Badge Generator for React Made Native Easy

This microservice generates realtime github repo badges for the reactnative.guide book
by querying Google analytics

![Total Users](https://badges.reactnative.guide/users)

![Total Page Views](https://badges.reactnative.guide/pageviews)

How does this work? : Blog post here: https://medium.com/google-cloud/displaying-google-analytics-metrics-in-your-readme-2ce45fb7ea76

Using Zeit now for hosting the microservice.

Make sure following env settings are present before deploying:

- ga-client-id
- ga-private-key-id
- ga-private-key
