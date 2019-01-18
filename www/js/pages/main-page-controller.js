/**
 * MainPageController
 * 
 * This controller sets global variables on the $rootScope in order to provide the necessary data
 * to other controllers and their children.
 */
app.controller('MainPageController', function ($rootScope, $scope, $ionicModal) {

  /**
   * Data that is bound to the UI and used globally
   */
  $rootScope.user = {
    firebaseUid: "-LWNssH8BZ5NX1LKh9Ld",
    email: "john.lenon@email.com",
    name: "John Lenon",
    profilePic: "img/ico-profile.svg",
    localProfilePic: "",
    latestViewedNotification: ""
  };

  /**
   * Classes and selectors used globally
   */
  $rootScope.classes = {
    hidden: "hidden",
    shrink: "shrinked",
    reShrink: "re-shrinked",
    noNewMsgs: "no-new-msgs",
    withImg: "with-img",
    shake: "shake-item",
    flip: "flip",
    iOS: "ios"
  }
  $rootScope.selectors = {
    pageHeader: "#page-header",
    pageBody: "#page-body",
    profileImg: "#profile-img",
    notificationsImg: "#notifications-img",
    newNotificationIndicator: "#new-notification-indicator"
  }

  /**
   * Notification's Modal
   */
  $ionicModal.fromTemplateUrl('notifications.html', function (modal) {
    $rootScope.taskModal = modal;
  }, {
    scope: $rootScope,
    animation: 'scale-in'
  });

  $scope.openNotificationsModal = function () {
    $scope.taskModal.show();
    
    if (ionic.Platform.isIOS()) {
      $rootScope.initializeIOS();
      $rootScope.getListNotifications($rootScope.user);

    } else if($rootScope.notifications.length == 0) {
      $rootScope.getListNotifications($rootScope.user);
    }

  };

  $rootScope.closeNotificationsModal = function () {
    $scope.taskModal.hide();
    $rootScope.updateStatusNotifications();
  };

  /**
   * Custom initialization for iOS
   */
  if (ionic.Platform.isIOS()) {
    // Update the UI
    angular.element(document.querySelector($rootScope.selectors.pageHeader)).addClass($rootScope.classes.iOS);
    angular.element(document.querySelector($rootScope.selectors.pageBody)).addClass($rootScope.classes.iOS);

    // TODO: Fix the SSL issue on iOS or implement a web socket on our API to notify about new notifications
    // iOS didn't like the requests created to connect to Firebase due to a SSL certificate issue, so, 
    // until a web socket is implemented on the API responsible for delivering the notifications, 
    // the 'startNotificationsWatcher', which regularly pulls resources from the API in a specific 
    // interval, could be a solution.
    setTimeout(function() {
      $rootScope.startNotificationsWatcher();
    }, 2000);
  }

  setTimeout(function() {
    $rootScope.initImagePicker();
  }, 3000);

});