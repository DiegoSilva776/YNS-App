/**
 * MainPageController
 * 
 * This controller sets global variables on the $rootScope in order to provide the necessary data
 * to other controllers and their children.
 */
app.controller('MainPageController', function ($rootScope, $scope, $ionicModal) {

  /**
   * Data that is bound to the UI
   */
  $rootScope.user = {
    email: "yns.user.1@email.com",
    name: "John Doe",
    profilePic: "file:///storage/emulated/0/images/undefined.jpg",
    latestNotification: "..."
  };
  $rootScope.msgEmptyList = {
    title: "Empty list",
    msg: "There isn't a notification right now, but we'll let you know if something cool happens."
  }

  /**
   * Classes and selectors
   */
  $rootScope.classes = {
    hidden: "hidden",
    shrink: "shrinked",
    reShrink: "re-shrinked",
    noNewMsgs: "no-new-msgs",
    withImg: "with-img",
    shake: "shake-item",
    flip: "flip"
  }

  $rootScope.selectors = {
    profileImgId: "profile-img",
    emptyListNotifications: "empty-list-notifications",
    notificationsImg: "#notifications-img",
    newNotificationIndicator: "#new-notification-indicator",
    getNotificationId: function (idx) {
      return "#notification-" + idx;
    },
    getNotificationShrinkId: function (idx) {
      return "#notification-shrink-" + idx;
    }
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
  };

  $rootScope.closeNotificationsModal = function () {
    $scope.taskModal.hide();
    $rootScope.updateStatusNotifications();
  };

});