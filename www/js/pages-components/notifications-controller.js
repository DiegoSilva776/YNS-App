/**
 * NotificationsController
 * 
 * This controller is responsible for opening the modal dialog that holds a list of notifications 
 * from the YNS - API. It also listens for new notifications and displays them according to an
 * attribute within the notification "scheduleTime".
 */
app.controller('NotificationsController', function ($rootScope, $scope, notificationsPresenter) {
    
    TAG = "NotificationsController";

    /**
     * Data bound to the UI and is visible to other controllers
     */
    $rootScope.notifications = [];

    /**
     * Data that is bound to the UI and used locally
     */
    $scope.isThereNewNotification = false;
    $rootScope.msgEmptyList = {
        title: "Empty list",
        msg: "There isn't a notification right now, but we'll let you know if something cool happen."
    }

    /**
     * Selectors used locally
     */
    $scope.selectors = {
        notificationModalHeader: "#notification-modal-header",
        notificationModalBody: "#notification-modal-body",
        msgEmptyList: "#empty-list-notifications",
        getNotificationId: function (idx) {
            return "#notification-" + idx;
        },
        getNotificationShrinkId: function (idx) {
            return "#notification-shrink-" + idx;
        }
    }
    
    /**
     * UI Events
     */
    $rootScope.expandListItem = function (idx) {
        try {
            var notification = $scope.getNotificationById(idx);

            if (notification !== null) {
                var notificationId = $scope.selectors.getNotificationId(idx);
                var notifShrinkIndicatorId = $scope.selectors.getNotificationShrinkId(idx);
    
                angular.element(document.querySelector(notificationId)).removeClass($rootScope.classes.shrink);
                angular.element(document.querySelector(notifShrinkIndicatorId)).addClass($rootScope.classes.hidden);
            }

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_EXPAND_LIST_ITEM} ${err}`);
        }
    };

    $scope.getNotificationById = function (id) {
        try {

            for (var i = 0; i < $rootScope.notifications.length; i++) {
                var notification = $rootScope.notifications[i];

                if (notification.firebaseUid === id) {
                    return notification;
                }
            }

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_GET_NOTIFICATION_BY_ID} ${err}`);
        }

        return null;
    };

    $rootScope.closeMsg = function (idx) {
        try {
            var notification = $scope.getNotificationById(idx);

            if (notification !== null) {
                notification.new = false;
                $scope.shrinkNotification(true, idx);
                $scope.upsertStatusUserNotification(notification);
            }

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_CLOSE_MSG_CARD} ${err}`);
        }
    };

    $scope.shrinkNotification = function (shrink, idx) {
        try {
            var notificationId = $scope.selectors.getNotificationId(idx);
            var el = document.querySelector(notificationId)

            if (shrink) {
                angular.element(el).addClass($rootScope.classes.reShrink);
            } else {
                angular.element(el).removeClass($rootScope.classes.reShrink);
            }

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_SHRINK_NOTIFICATION} ${err}`);
        }
    }

    $rootScope.updateStatusNotifications = function () {
        try {
            $scope.isThereNewNotification = false;

            for (var i = 0; i < $rootScope.notifications.length; i++) {
                var notification = $rootScope.notifications[i];

                if (notification.new) {
                    $scope.isThereNewNotification = true;
                } else {
                    $scope.shrinkNotification(true, notification.firebaseUid);
                    $rootScope.user.latestViewedNotification = notification.firebaseUid;
                }
            }

            $scope.showUnreadNotificatonIndicator($scope.isThereNewNotification);

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPDATE_NOTIFICATIONS} ${err}`);
        }
    }

    $scope.showEmptyListMsg = function() {
        var emptyList = angular.element(document.querySelector($scope.selectors.msgEmptyList));
        
        if ($rootScope.notifications.length == 0) {
            emptyList.removeClass($rootScope.classes.hidden);
        } else {
            emptyList.addClass($rootScope.classes.hidden);
        }
    }

    $scope.showUnreadNotificatonIndicator = function (show) {
        try {

            if (show) {
                angular.element(document.querySelector($rootScope.selectors.notificationsImg)).removeClass($rootScope.classes.noNewMsgs);
                angular.element(document.querySelector($rootScope.selectors.notificationsImg)).addClass($rootScope.classes.shake);
                angular.element(document.querySelector($rootScope.selectors.newNotificationIndicator)).removeClass($rootScope.classes.hidden);
            } else {
                angular.element(document.querySelector($rootScope.selectors.notificationsImg)).addClass($rootScope.classes.noNewMsgs);
                angular.element(document.querySelector($rootScope.selectors.notificationsImg)).removeClass($rootScope.classes.shake);
                angular.element(document.querySelector($rootScope.selectors.newNotificationIndicator)).addClass($rootScope.classes.hidden);
            }

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_SHOW_UNREAD_NOTIFICATIONS} ${err}`);
        }
    }

    /**
     * Connection to data services
     */
    $scope.initPresenters = function () {

        if (ionic.Platform.isAndroid()) {
            $scope.listenNewNotifications();
        }

        notificationsPresenter.getUser($rootScope.user.email)
        .then(function(user) {
            $rootScope.user = user;
            $rootScope.getListNotifications($rootScope.user);
            $rootScope.updateProfileImage(false, $rootScope.user.profilePic);
        }).catch(function(err) {
            $rootScope.upsertUserOnNotificationAPI();
        });
    }

    $rootScope.upsertUserOnNotificationAPI = function () {
        notificationsPresenter.upsertUser($rootScope.user.email,
            $rootScope.user.name,
            $rootScope.user.profilePic,
            $rootScope.user.latestViewedNotification)
            .then(function (user) {

                try {

                    if (user != undefined) {
                        $rootScope.user = user;
                        $rootScope.getListNotifications($rootScope.user);
                    } else {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL}`);
                    }
                } catch(err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL} ${err}`);
                }
            }).catch(function (err) {
                log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL} ${err}`);
            });
    }

    $scope.listenNewNotifications = function () {
        try {

            if (firebase != undefined) {
                var notificationsRef = firebase.database().ref("notifications/");
                notificationsRef.on('value', function (snapshot) {
    
                    try {
    
                        if ($rootScope.user.firebaseUid != undefined) {
                            $rootScope.getListNotifications($rootScope.user)
                        } else {
                            $rootScope.upsertUserOnNotificationAPI();
                        }
                    } catch(err) {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_LISTEN_NEW_NOTIFICATIONS} ${err}`);
                    }
                });
            } else {

                if ($rootScope.user.firebaseUid != undefined) {
                    $rootScope.getListNotifications($rootScope.user)
                } else {
                    $rootScope.upsertUserOnNotificationAPI();
                }
            }
        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_LISTEN_NEW_NOTIFICATIONS} ${err}`);
        }
    }

    $rootScope.startNotificationsWatcher = function() {
        setTimeout(function() {
            log.logMessage(`${TAG} ${msgs.MSG_START_NOTIFICATION_WATCHER} ${new Date()}`);

            $rootScope.getListNotifications($rootScope.user);
            $rootScope.startNotificationsWatcher();

        }, configs.network.TIMEOUT_WATCH_NOTIFICATIONS);
    }

    $rootScope.getListNotifications = function (user) {
        notificationsPresenter.getListNotifications(user)
            .then(function (updatedNotifications) {

                try {

                    if (updatedNotifications) {
                        $rootScope.notifications = updatedNotifications;
    
                        for (var i = 0; i < $rootScope.notifications.length; i++) {
                            $rootScope.notifications[i].receivedAt = new Date().toISOString();
                        }
    
                        $scope.updateStatusNotifications();
                        $scope.showEmptyListMsg();
                        
                    } else {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_LOAD_NOTIFICATIONS}`);
                        $scope.showEmptyListMsg();
                    }
                } catch(err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_LOAD_NOTIFICATIONS} ${err}`);
                    $scope.showEmptyListMsg();
                }
            }).catch(function (err) {
                log.logMessage(`${TAG} ${msgs.MSG_FAILED_LOAD_NOTIFICATIONS} ${err}`);
                $scope.showEmptyListMsg();
            });
    }

    $scope.upsertStatusUserNotification = function (notification) {
        notificationsPresenter.upsertUserNotification($rootScope.user, notification)
            .then(function (success) {

                try {

                    if (success) {
                        $scope.updateStatusNotifications();

                        if (!$scope.isThereNewNotification) {
                            $rootScope.closeNotificationsModal();
                        }
                    } else {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL}`);
                    }
                } catch(err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL} ${err}`);
                }
            }).catch(function (err) {
                log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL} ${err}`);
            });
    }
    // ./Connection to data services

    /**
     * Custom initialization for iOS
     */
    $rootScope.initializeIOS = function() {
        
        if (ionic.Platform.isIOS()) {
            var modalHeader = angular.element(document.querySelector($scope.selectors.notificationModalHeader));
            var modalBody = angular.element(document.querySelector($scope.selectors.notificationModalBody));
    
            modalHeader.addClass($rootScope.classes.iOS);
            modalBody.addClass($rootScope.classes.iOS);
        }
    }

    /**
     * Global initialization
     */
    $scope.initPresenters();

})