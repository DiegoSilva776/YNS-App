// dataservice factory
angular.module('YnsApp.NotificationsService', [
    'ionic'
])
.factory('notificationsService', notificationsService);

notificationsService.$inject = ['$http'];

function notificationsService($http) {

    return {
        getVersionAPI: getVersionAPI,
        upsertUser: upsertUser,
        getUserByEmail: getUserByEmail,
        getAllNotifications: getAllNotifications,
        getUserNotifications: getUserNotifications,
        upsertUserNotification: upsertUserNotification
    };

    function getVersionAPI() {
        return $http.get(configs.network.BASE_URL_NOTIFICATIONS_API)
            .then(getData)
            .catch(getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }
    
    function upsertUser(email, name, profilePic, latestNotification) {
        var request = {
            async: true,
            crossDomain: true,
            processData: false,
            method: 'POST',
            url: configs.network.BASE_URL_NOTIFICATIONS_API + "users/",
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            data: {
                email : email,
                name : name,
                profilePic : profilePic,
                latestNotification : latestNotification
            }
        }

        return $http(request)
            .then(getData, getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }

    function getUserByEmail(email) {
        return $http.get(configs.network.BASE_URL_NOTIFICATIONS_API + `users/${email}`)
            .then(getData)
            .catch(getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }

    function getAllNotifications() {
        return $http.get(configs.network.BASE_URL_NOTIFICATIONS_API + "notifications/")
            .then(getData)
            .catch(getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }

    function getUserNotifications(user) {
        var request = {
            async: true,
            crossDomain: true,
            processData: false,
            method: 'POST',
            url: configs.network.BASE_URL_NOTIFICATIONS_API + "getAllUserNotifications/",
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            data: {
                user : user
            }
        }

        return $http(request)
            .then(getData, getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }

    function upsertUserNotification(user, notification) {
        var request = {
            async: true,
            crossDomain: true,
            processData: false,
            method: 'POST',
            url: configs.network.BASE_URL_NOTIFICATIONS_API + "userNotifications/",
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            data: {
                user : user,
                notification : notification
            }
        }

        return $http(request)
            .then(getData, getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }
    
}
