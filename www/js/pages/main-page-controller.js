// Ionic YNS App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'yns_app' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
  .module('YnsApp', [
    'ionic',
    'YnsApp.NotificationsPresenter'
  ])

.controller('MainPageController', function($scope, $ionicModal, notificationsPresenter) {
  /**
   * Data that is bound to the UI
   */
  $scope.hasInitialized = false;
  $scope.isThereNewNotification = false;
  $scope.user = {
    email : "yns.user.1@email.com",
    name : "John Doe",
	  profilePic : "...",
    latestNotification : "..."
  };
  $scope.notifications = [];
  
  /**
   * Classes and selectors
   */
  $scope.classes = {
    hidden: "hidden",
    shrink: "shrinked",
    reShrink: "re-shrinked",
    noNewMsgs: "no-new-msgs"
  }

  $scope.selectors = {
    notificationsImg: "#notifications-img",
    newNotificationIndicator: "#new-notification-indicator",
    getNotificationId: function(idx) {
      return "#notification-" + idx;
    },
    getNotificationShrinkId: function(idx) {
      return "#notification-shrink-" + idx;
    }
  }

  /**
   * Notification's Modal
   */
  $ionicModal.fromTemplateUrl('notifications.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope,
    animation: 'scale-in'
  });

  $scope.openNotificationsModal = function() {
    $scope.taskModal.show();
  };

  $scope.closeNotificationsModal = function() {
    $scope.taskModal.hide();
    $scope.updateStatusNotifications();
  };

  $scope.expandListItem = function(idx) {
    var notification = $scope.getNotificationById(idx);
    
    if (notification !== null) {
      var notificationId = $scope.selectors.getNotificationId(idx);
      var notifShrinkIndicatorId = $scope.selectors.getNotificationShrinkId(idx);

      angular.element(document.querySelector(notificationId)).removeClass($scope.classes.shrink);
      angular.element(document.querySelector(notifShrinkIndicatorId)).addClass($scope.classes.hidden);
    }
  };

  $scope.getNotificationById = function(id) {

    for (var i = 0; i < $scope.notifications.length; i++) {
      var notification = $scope.notifications[i];

      if (notification.firebaseUid === id) {
        return notification;
      }
    }

    return null;
  };

  $scope.closeMsg = function(idx) {
    var notification = $scope.getNotificationById(idx);
    
    if (notification !== null) {
      notification.new = false;
      $scope.shrinkNotification(true, idx);
      upsertStatusUserNotification(notification);
    }
  };

  $scope.shrinkNotification = function(shrink, idx) {
    var notificationId = $scope.selectors.getNotificationId(idx);
    var el = document.querySelector(notificationId)

    if (shrink) {
      angular.element(el).addClass($scope.classes.reShrink);
    } else {
      angular.element(el).removeClass($scope.classes.reShrink);
    }
  }

  $scope.updateStatusNotifications = function() {
    $scope.isThereNewNotification = false;

    for (var i = 0; i < $scope.notifications.length; i++) {
      var notification = $scope.notifications[i];

      if (notification.new) {
        $scope.isThereNewNotification = true;
      } else {
        $scope.shrinkNotification(true, notification.firebaseUid);
      }
    }

    $scope.showUnreadNotificatonIndicator($scope.isThereNewNotification);
  }

  $scope.showUnreadNotificatonIndicator = function(show) {
    
    if (show) {
      angular.element(document.querySelector($scope.selectors.notificationsImg)).removeClass($scope.classes.noNewMsgs);
      angular.element(document.querySelector($scope.selectors.newNotificationIndicator)).removeClass($scope.classes.hidden);
    } else {
      angular.element(document.querySelector($scope.selectors.notificationsImg)).addClass($scope.classes.noNewMsgs);
      angular.element(document.querySelector($scope.selectors.newNotificationIndicator)).addClass($scope.classes.hidden);
    }
  }

  /**
   * Connect to services via presenters and feed the UI
   */
  if (!$scope.hasInitialized) {
    $scope.hasInitialized = true;
    initPresenters();
  }
  
  function initPresenters() {
    registerUserOnNotificationAPI();
    listenNewNotifications();
  }

  function registerUserOnNotificationAPI() {
    notificationsPresenter.upsertUser($scope.user.email, 
                                      $scope.user.name, 
                                      $scope.user.profilePic, 
                                      $scope.user.latestNotification)
    .then(function(user) {
          
      if (user) {
        $scope.user = user;
        getListNotifications($scope.user);
      } else {
        console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);  
      }
    }).catch(function(err) {
      console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);  
    });
  }

  function listenNewNotifications() {
    try {
      var notificationsRef = firebase.database().ref("notifications/");
      notificationsRef.on('value', function(snapshot) {

        if ($scope.user.firebaseUid != undefined) {
          getListNotifications($scope.user)
        } else {
          registerUserOnNotificationAPI();
        }
      });
    } catch (err) {
      console.log(msgs.MSG_FAILED_LISTEN_NEW_NOTIFICATIONS + err);
    }
  }

  function getListNotifications(user) {
    notificationsPresenter.getListNotifications(user)
    .then(function(updatedNotifications) {

      if (updatedNotifications) {
        $scope.notifications = updatedNotifications;
        
        for (var i = 0; i < $scope.notifications.length; i++) {
          $scope.notifications[i].receivedAt = new Date().toISOString();
        }

        $scope.updateStatusNotifications();
      } else {
        console.log(msgs.MSG_FAILED_LOAD_NOTIFICATIONS + err);
      }
    }).catch(function(err) {
      console.log(msgs.MSG_FAILED_LOAD_NOTIFICATIONS + err);
    });
  }

  function upsertStatusUserNotification(notification) {
    notificationsPresenter.upsertUserNotification($scope.user, 
                                                  notification)
    .then(function(success) {
      
      if (success) {
        $scope.updateStatusNotifications();

        if (!$scope.isThereNewNotification) {
          $scope.closeNotificationsModal();
        }
      } else {
        console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);
      }
    }).catch(function(err) {
      console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);
    });
  }

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
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
