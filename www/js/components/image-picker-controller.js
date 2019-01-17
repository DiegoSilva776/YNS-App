/**
 * ImagePickerController
 * 
 * This controller is responsible for picking an image in the image's gallery of a user's device.
 * Once an image is picked, it is sent to Firebase Cloud Storage, and then the image is stored
 * in the user device with a reusable URL, one that can load the image from a file without the need
 * of internet, a simple cache solution.
 */
app.controller('ImagePickerController', function ($rootScope, $scope, $cordovaImagePicker) {
    
    TAG = "ImagePickerController";

    document.addEventListener("deviceready", function () {
        $rootScope.initImagePicker();
    }, false);

    $rootScope.initImagePicker = function() {
        $scope.imagesDirectory = "";
        $scope.createDirectory();
        $scope.readFile($rootScope.user.profilePic);
    }

    $scope.createDirectory = function() {
        try {
            var parentDirectory = cordova.file.externalRootDirectory;
            var directoryToCreate = configs.files.NAME_LOCAL_IMAGES_DIRECTORY;
            $scope.imagesDirectory = `${cordova.file.externalRootDirectory}${directoryToCreate}`;
    
            window.resolveLocalFileSystemURL(parentDirectory, function (dirEntry) {
    
                dirEntry.getDirectory(directoryToCreate, { create: true },
                    function () {
                        log.logMessage(msgs.MSG_CREATED_IMGS_DIRECTORY);
                    },
                    function (err) {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_CREATE_IMGS_DIRECTORY} ${err}`);
                    });
            });
        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_CREATE_IMGS_DIRECTORY} ${err}`);
        }
    }

    $rootScope.openImagePicker = function() {

        if (window.imagePicker != undefined) {
            $cordovaImagePicker.getPictures({
                maximumImagesCount: 10,
                width: 800,
                height: 800,
                quality: 80,
                outputType: window.imagePicker.OutputType.BASE64_STRING
            })
                .then(function (results) {
    
                    try {
    
                        for (var i = 0; i < results.length; i++) {
                            var imgBase64Str = results[i];
    
                            var imgFilename = `${$rootScope.user.firebaseUid}.jpg`;
                            var cloudImgFilename = `${configs.files.PREFIX_PROFILE_IMGS}${imgFilename}`;
                            var contentType = configs.files.IMGS_CONTENT_TYPE;
    
                            if (firebase != undefined) {
                                var storageRef = firebase.storage().ref();
                                var mountainImagesRef = storageRef.child(cloudImgFilename);
        
                                mountainImagesRef.putString(imgBase64Str, 'base64').then(function (snapshot) {
        
                                    if (snapshot != undefined && snapshot != null) {
        
                                        if (snapshot.state == "success") {
                                            snapshot.ref.getDownloadURL().then(function (downloadURL) {
                                                $rootScope.user.profilePic = downloadURL;
                                                $rootScope.registerUserOnNotificationAPI($rootScope.user);
                                                $scope.updateProfileImage(false, $rootScope.user.profilePic);
                                                $scope.savebase64AsFile($scope.imagesDirectory, imgFilename, imgBase64Str, contentType);
                                                $scope.readFile($rootScope.user.localProfilePic);
                                            });
                                        }
                                    }
                                });
                            } else {
                                log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
    
                                $scope.updateProfileImage(false, $rootScope.user.profilePic);
                                $scope.savebase64AsFile($scope.imagesDirectory, imgFilename, imgBase64Str, contentType);
                                $scope.readFile($rootScope.user.localProfilePic);
                            }
                        }
                    } catch(err) {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
                    }
                }, function (err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
                    $scope.adjustImgForAvatar(true);
                });
        }
    }

    $scope.updateProfileImage = function(fromLocalStorage, imgUrlOrStrBase64) {

        try {

            if (fromLocalStorage) {
                document.getElementById($rootScope.selectors.profileImg.replace("#", "")).src = imgUrlOrStrBase64;
            } else {
                angular.element(document.querySelector($rootScope.selectors.profileImg)).attr("src", imgUrlOrStrBase64);
            }

            $scope.adjustImgForAvatar(false);

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
        }
    }

    $scope.adjustImgForAvatar = function(adjustIt) {

        try {

            if (adjustIt) {
                angular.element(document.querySelector($rootScope.selectors.profileImg)).removeClass($rootScope.classes.withImg);
            } else {
                angular.element(document.querySelector($rootScope.selectors.profileImg)).addClass($rootScope.classes.withImg);
            }

            angular.element(document.querySelector($rootScope.selectors.profileImg)).addClass($rootScope.classes.flip);

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
        }
    }

    $scope.savebase64AsFile = function(folderPath, filename, base64, contentType) {
        var dataBlob = $scope.b64toBlob(base64, contentType);
        window.resolveLocalFileSystemURL(folderPath, function (dir) {

            dir.getFile(filename, { create: true }, function (file) {

                file.createWriter(
                    function (fileWriter) {
                        fileWriter.onwrite = function () {
                            $rootScope.user.localProfilePic = `${folderPath}/${filename}`;
                        }
                        fileWriter.write(dataBlob);
                    }, function () {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_SAVE_64S_FILE} ${folderPath}`);
                    }
                );
            });
        });
    }

    $scope.b64toBlob = function(b64Data, contentType, sliceSize) {
        try {
            var contentType = contentType || '';
            var sliceSize = sliceSize || 512;
            var byteCharacters = window.atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);

                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_SAVE_64S_BLOB} ${err}`);
        }

        return new Blob(byteArrays, { type: contentType });
    }

    $scope.readFile = function(pathToFile) {
        try {

            if (pathToFile != undefined) {
                window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {
                    fileEntry.file(function (file) {
                        var reader = new FileReader();
        
                        reader.onloadend = function (event) {
                            $scope.updateProfileImage(true, this.result);
                        };
        
                        reader.readAsDataURL(file);
                    });
                });
            }
        } catch(err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_READ_FILE} ${pathToFile}`);   
        }
    }

})
