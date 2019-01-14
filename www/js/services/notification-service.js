// dataservice factory
angular
    .module('YnsApp.NotificationsService', [
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
        getUserNotification: getUserNotification,
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
            method: 'POST',
            url: configs.network.BASE_URL_NOTIFICATIONS_API + "users/",
            headers: {
              'Content-Type': 'application/json'
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

    function getUserNotification(userFirebaseUid, notificationFirebaseUid) {
        return $http.get(configs.network.BASE_URL_NOTIFICATIONS_API + `userNotifications/${userFirebaseUid}/${notificationFirebaseUid}`)
            .then(getData)
            .catch(getError);

        function getData(response) {
            return response;
        }

        function getError(error) {
            return error;
        }
    }

    function upsertUserNotification(user, notification) {
        var request = {
            method: 'POST',
            url: configs.network.BASE_URL_NOTIFICATIONS_API + "userNotifications/",
            headers: {
              'Content-Type': 'application/json'
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

/** 
 
// dataservice factory
angular
    .module('YnsApp.NotificationsService', ['ionic'])
    .factory('notificationsService', notificationsService);

notificationsService.$inject = ['$http'];

function notificationsService($http) {

    var getVersionNotificationsAPI = function() {
        return $http.get('https://yns-api.herokuapp.com/api/')
            .then(getAvengersComplete)
            .catch(getAvengersFailed);

        function gotData(response) {
            return response.data.results;
        }

        function gotError(error) {
            console.log('XHR Failed for getAvengers.' + error.data);
        }
    }
}


 */