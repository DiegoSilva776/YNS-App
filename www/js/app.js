/**
 * YnsAPP
 * 
 * A simple MVP app that showcases the capabilities of the YNS - API, a notification service that 
 * informs the user, in real time, with the best news related to the Youper app.
 */

var app = angular.module('YnsApp', [
  'ionic',
  'ngCordova',
  'YnsApp.NotificationsPresenter',
  'YnsApp.StorageService'
]);

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.Keyboard) {
      window.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
})

app.config(function($ionicConfigProvider){
  $ionicConfigProvider.views.maxCache(0);
});