
# GitHubMonitor

A simple react native application with [IBM Cloud Push Service](https://console.bluemix.net/docs/services/mobilepush/index.html#gettingstartedtemplate) and [Cloud functions](https://console.bluemix.net/docs/openwhisk/index.html#getting-started-with-openwhisk).

This sample is built on React Native. It is a simple application which shows all repos in a GitHub Organization and send a push notification when an issue or Pull Request is created, updated or Closed.

## Requirements 

- Xcode 10+
- Android: minSdkVersion 16+, compileSdkVersion 28+
- React Native >= 0.57.8
- React Native CLI >= 2.0.1
- IBM Cloud Account 

## Start

Let's start by creating the Cloud Functions Actions and triggers. 

#### Create Action to get all repository . 

Create a nodeJs action with code given in `getReposAction.js`.

Add the github organization name,

```
let orgName = "Gypsyan";
```

#### Create Action to listen for Github webhooks. 

 Create a nodeJs action with code given in `ReactNativeAction.js`. Make sure you have updated the  