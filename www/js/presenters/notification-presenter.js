// dataservice factory
angular.module('YnsApp.NotificationsPresenter', [
    'ionic',
    'YnsApp.NotificationsService'
])
.factory('notificationsPresenter', notificationsPresenter);

notificationsPresenter.$inject = ['notificationsService'];

function notificationsPresenter(notificationsService) {

    return {
        upsertUser: upsertUser,
        getListNotifications: getListNotifications,
        upsertUserNotification: upsertUserNotification
    };

    // Notification API Users
    function upsertUser(email, name, profilePic, latestNotification) {

        return new Promise(function(resolve, reject) {
            notificationsService.upsertUser(email, name, profilePic, latestNotification)
            .then(function(data) {
                    
                try {
                    var success = data.data.data;

                    if (success) {
                        notificationsService.getUserByEmail(email)
                        .then(function(data) {
                            try {
                                user = data.data.data;
                                resolve(user);

                            } catch (err) {
                                reject(false);
                            }
                        });
                    } else {
                        reject(false)
                    }
                } catch (err) {
                    reject(false);
                }
            });
        });
    }

    // Notifications
    function getListNotifications(user) {

        return new Promise(function(resolve, reject) {
            notificationsService.getAllNotifications()
            .then(function(data) {

                try {
                    var notifications = []
                    data = data.data.data;
                    
                    for (var i = 0; i < data.length; i++) {
                        var notification = data[i];
                        notification.new = true;

                        var scheduleTime = new Date(notification.scheduleTime);
                        var currentTime = new Date();
                        
                        if (scheduleTime < currentTime) {
                            var diff = currentTime - scheduleTime;
                            var time = math.utils.dhm(diff);
                            notification.time = time
                            notifications.push(notification);

                            notifications.sort(function(a, b) {
                                return new Date(b.scheduleTime) - new Date(a.scheduleTime);
                            });
                        }
                    }

                    notificationsService.getUserNotifications(user)
                        .then(function(data) {

                            try {
                                userNotifications = data.data.data;
                            
                                for (var i = 0; i < notifications.length; i++) {
                                    var notification = notifications[i];
    
                                    for (var j = 0; j < userNotifications.length; j++) {
                                        var userNotification = userNotifications[j];
        
                                        if (userNotification.user.firebaseUid === user.firebaseUid &&
                                            userNotification.notification.firebaseUid === notification.firebaseUid) {
                                            notification.new = false;
                                        }    
                                    }
                                }
    
                                resolve(notifications);
                            } catch(err) {
                                reject(false);
                            }
                        });

                } catch (err) {
                    reject(false);
                }
            });
        });
    }

    function upsertUserNotification(user, notification) {

        return new Promise(function(resolve, reject) {
            notificationsService.upsertUserNotification(user, notification)
            .then(function(data) {

                try {
                    var success = data.data.data;

                    if (success) {
                        resolve(true);
                    } else {
                        reject(false);                
                    }
                } catch (err) {
                    reject(false);
                }
            });
        });
    }
    
}
