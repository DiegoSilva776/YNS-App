// Ionic YNS App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'yns_app' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
  .module('YnsApp', [
    'ionic',
    'YnsApp.NotificationsService'
  ])

.controller('MainPageController', function($scope, $ionicModal, notificationsService) {
  /**
   * Globals
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
  // TODO: Get notifications from server
  $scope.notifications = [
    {
      title: "New Feature!",
      msg: 'Now you can customize your avatar uploading your selfie.<br/>Just click on the avatar, take or select a picture and save.<br/><img src="https://lh3.googleusercontent.com/-Ck8kcWIE4uk/AAAAAAAAAAI/AAAAAAAAAAA/AKxrwca-XBPLWpe6XTs4cMsKVxwZYZfKJQ/mo/photo.jpg?sz=46"/>',
      time: "5 minutes ago",
      hide: true,
      new: true
    },
    {
      title: "Notifications",
      msg: "Now you can receive a bunch of interesting info by clicking on the notification button",
      time: "10 minutes ago",
      hide: true,
      new: true
    }
  ];
  //.TODO

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
  };

  $scope.expandListItem = function($e, idx, itemTitle, itemMsg) {
    var notification = $scope.getNotificationByTitleMsg(itemTitle, itemMsg);
    
    if (notification !== null) {
      var notificationId = $scope.selectors.getNotificationId(idx);
      var notifShrinkIndicatorId = $scope.selectors.getNotificationShrinkId(idx);

      angular.element(document.querySelector(notificationId)).removeClass($scope.classes.shrink);
      angular.element(document.querySelector(notifShrinkIndicatorId)).addClass($scope.classes.hidden);
    }
  };

  $scope.getNotificationByTitleMsg = function(title, msg) {

    for (var i = 0; i < $scope.notifications.length; i++) {
      var notification = $scope.notifications[i];

      if (notification.title === title && notification.msg === msg) {
        return notification;
      }
    }

    return null;
  };

  $scope.closeMsg = function($e, idx, itemTitle, itemMsg) {
    var notification = $scope.getNotificationByTitleMsg(itemTitle, itemMsg);
    
    if (notification !== null) {
      notification.new = false;

      var notificationId = $scope.selectors.getNotificationId(idx);
      angular.element(document.querySelector(notificationId)).addClass($scope.classes.reShrink);

      // Todo, make a request to the server to mark the selected notification as read by the current user
      // ..

      if ($scope.wereAllNotificationsRead()) {
        $scope.hideUnreadNotificationIndicator();
        $scope.closeNotificationsModal();
      }
      // ./Todo
    }
  };

  $scope.wereAllNotificationsRead = function() {

    for (var i = 0; i < $scope.notifications.length; i++) {
      var notification = $scope.notifications[i];

      if (notification.new) {
        return false;
      }
    }

    return true;
  }

  $scope.hideUnreadNotificationIndicator = function() {
    angular.element(document.querySelector($scope.selectors.notificationsImg)).addClass($scope.classes.noNewMsgs);
    angular.element(document.querySelector($scope.selectors.newNotificationIndicator)).addClass($scope.classes.hidden);
  }

  if ($scope.wereAllNotificationsRead()) {
    $scope.hideUnreadNotificationIndicator();
  }

  /**
   * Connection to services
   */
  initNotificationsService();

  function initNotificationsService() {
    // Globals
    notificationsService.getVersionAPI()
      .then(function(data) {
        console.log(JSON.stringify(data));
      });

    // Users
    notificationsService.upsertUser("yns.user1@email.com", "yns.user", "...", "...")
      .then(function(data) {
        console.log(JSON.stringify(data));
      });

    notificationsService.getUserByEmail("user1@email.com")
      .then(function(data) {
        console.log(JSON.stringify(data));
      });

    // Notifications
    notificationsService.getAllNotifications()
      .then(function(data) {
        console.log(JSON.stringify(data));
      });

    notificationsService.getUserNotification("-LWC0NGRCPv3yw89Uzod", "-LWC1modNMprBz00KnY8")
      .then(function(data) {
        data = data.data.data;
        
        var user = data.user;
        var notification = data.notification;

        notificationsService.upsertUserNotification(user, notification)
          .then(function(data) {
            console.log(JSON.stringify(data));
          });
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
