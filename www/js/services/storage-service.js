// dataservice factory
angular.module('YnsApp.StorageService', [
    'ionic'
])
.factory('storageService', storageService);

storageService.$inject = ['$http'];

function storageService($http) {

    return {
        uploadImg: uploadImg
    };
                
    function uploadImg(userEmail, filename, fileExtension, base64String) {
        var request = {
            async: true,
            crossDomain: true,
            processData: false,
            method: 'POST',
            url: configs.network.BASE_URL_NOTIFICATIONS_API + "imageUpload/",
            headers: {
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            },
            data: {
                userEmail : userEmail,
                filename: filename,
                fileExtension: fileExtension,
                base64String: base64String
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
