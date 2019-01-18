/**
 * ImagePickerController
 * 
 * This controller is responsible for picking an image in the image's gallery of a user's device.
 * Once an image is picked, it is sent to Firebase Cloud Storage, and then the image is stored
 * in the user device with a reusable URL, one that can load the image from a file without the need
 * of internet, a simple cache solution.
 */
app.controller('ImagePickerController', function ($rootScope, $scope, $cordovaImagePicker, $window, $ionicHistory, $cordovaFile, storageService) {

    TAG = "ImagePickerController";

    $scope.isIonicDeviceReady = false;
    $scope.storageDirectory = "";
    $scope.triedCreateImgAfterDir = 0;

    $rootScope.initImagePicker = function () {
        document.addEventListener("deviceready", function () {
            $scope.isIonicDeviceReady = true;
            $scope.createDirectory(false, null, null);

            $rootScope.user.localProfilePic = localStorage.getItem(`profile_${$rootScope.user.email}`);
            $scope.loadProfileImageFromCacheFileSystem($rootScope.user.localProfilePic);
        }, true);
    }

    $scope.createDirectory = function (tryCreateImg, filename, base64String) {
        try {
            $scope.initBaseDirectory();

            $cordovaFile.createDir($scope.storageDirectory, "images", false)
                .then(function (success) {

                    if (tryCreateImg != undefined) {

                        if (tryCreateImg && $scope.triedCreateImgAfterDir == 0) {
                            $scope.triedCreateImgAfterDir = 1;
                            $scope.storeProfileImageLocally(filename, base64String);
                        }
                    }

                }).catch(function (err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_CREATE_IMGS_DIRECTORY} ${JSON.stringify(err)}`);
                });

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_CREATE_IMGS_DIRECTORY} ${JSON.stringify(err)}`);
        }
    }

    /**
     * http://ngcordova.com/docs/plugins/file/
     */
    $scope.initBaseDirectory = function () {
        try {
            var appStorageDirectory = "";

            if (ionic.Platform.isIOS()) {
                appStorageDirectory = cordova.file.applicationDirectory;
            } else {
                appStorageDirectory = cordova.file.applicationStorageDirectory;
            }

            $scope.storageDirectory = appStorageDirectory;

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_CREATE_IMGS_DIRECTORY} ${err}`);
        }
    }

    $rootScope.openImagePicker = function () {

        if (window.imagePicker != undefined) {
            $cordovaImagePicker.getPictures({
                maximumImagesCount: 1,
                width: 800,
                height: 800,
                quality: 80,
                outputType: window.imagePicker.OutputType.BASE64_STRING
            }).then(function (results) {

                try {
                    var base64String = results[0];
                    var localImgFile = configs.files.getLocalImgFilename($rootScope.user.email);

                    storageService.uploadImg($rootScope.user.email,
                        configs.files.PART_ID_AVATAR_PICS,
                        configs.files.UPLOADED_IMGS_EXTENSION,
                        base64String)
                        .then(function (data) {
                            try {
                                $rootScope.user.profilePic = data.data.data;

                                // TODO: Fix this when the SSL issue on iOS 11.2 is solved.
                                if (ionic.Platform.isIOS()) {
                                    $rootScope.user.profilePic = $rootScope.user.profilePic.replace("https", "http");
                                }

                                // Update the user on the API with the remote avatar picture field
                                $rootScope.upsertUserOnNotificationAPI();
                                $rootScope.updateProfileImage(false, $rootScope.user.profilePic);
                                $scope.storeProfileImageLocally(localImgFile, base64String);

                            } catch (err) {
                                log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
                                alert(msgs.MSG_FAILED_STORE_PICTURE);
                            }
                        }).catch(function (err) {
                            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
                            alert(msgs.MSG_FAILED_STORE_PICTURE);
                        });

                } catch (err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
                }
            }).catch(function (err) {
                log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
                $scope.adjustImgForAvatar(true);
            });
        }
    }

    $rootScope.updateProfileImage = function (fromLocalStorage, imgUrlOrFile) {
        try {
            $ionicHistory.clearCache()
                .then(function () {
                    $scope.loadProfilePicture(fromLocalStorage, imgUrlOrFile);
                }).catch(function (err) {
                    $scope.loadProfilePicture(fromLocalStorage, imgUrlOrFile);
                });

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);

            if (imgUrlOrFile != undefined) {
                $scope.loadProfilePicture(fromLocalStorage, imgUrlOrFile);
            }
        }
    }

    $scope.loadProfilePicture = function (fromLocalStorage, imgUrlOrFile) {
        try {

            if (fromLocalStorage) {
                document.getElementById($rootScope.selectors.profileImg.replace("#", "")).src = imgUrlOrFile;
                $scope.adjustImgForAvatar(false);
            } else {

                if (/http/.test(imgUrlOrFile)) {
                    angular.element(document.querySelector($rootScope.selectors.profileImg)).attr("src", imgUrlOrFile);
                    $scope.adjustImgForAvatar(false);
                } else {
                    angular.element(document.querySelector($rootScope.selectors.profileImg)).attr("src", 'img/ico-profile.svg');
                    $scope.adjustImgForAvatar(true);
                }
            }

            angular.element(document.querySelector($rootScope.selectors.profileImg)).css("border-radius", "50px");

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
        }
    }

    $scope.adjustImgForAvatar = function (adjustIt) {

        try {

            if (adjustIt) {
                angular.element(document.querySelector($rootScope.selectors.profileImg)).removeClass($rootScope.classes.withImg);
            } else {
                angular.element(document.querySelector($rootScope.selectors.profileImg)).addClass($rootScope.classes.withImg);
            }

            angular.element(document.querySelector($rootScope.selectors.profileImg)).addClass($rootScope.classes.flip);

            if (ionic.Platform.isIOS()) {
                setTimeout(function() {
                    angular.element(document.querySelector($rootScope.selectors.profileImg)).removeClass($rootScope.classes.flip);
                    angular.element(document.querySelector($rootScope.selectors.profileImg)).addClass($rootScope.classes.flip);
                }, 1000);    
            }

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_UPLOAD_PROFILE_PIC} ${err}`);
        }
    }

    $scope.storeProfileImageLocally = function (filename, base64String) {
        try {
            $cordovaFile.checkDir($scope.storageDirectory, "images")
                .then(function (success) {

                    $cordovaFile.createFile($scope.storageDirectory + "images", filename, true)
                        .then(function (success) {
                            $scope.savebase64AsFile($scope.storageDirectory + "images", filename, base64String, configs.files.IMGS_CONTENT_TYPE);

                        }).catch(function (err) {
                            log.logMessage(`${TAG} Failed to store image using the default file system: ${err}`);
                        });

                }).catch(function (err) {
                    $scope.createDirectory(true, filename, base64String);
                });

        } catch (err) {
            log.logMessage(`${TAG} Failed to store image using the default file system: ${err}`);
        }
    }

    $scope.savebase64AsFile = function (directory, filename, base64, contentType) {
        var dataBlob = $scope.b64toBlob(base64, contentType);

        $window.resolveLocalFileSystemURL(directory, function (dir) {

            dir.getFile(filename, { create: true }, function (file) {

                file.createWriter(function (fileWriter) {

                    fileWriter.onwrite = function () {
                        $rootScope.user.localProfilePic = filename;
                        localStorage.setItem(`profile_${$rootScope.user.email}`, filename);

                        $rootScope.upsertUserOnNotificationAPI();
                        $scope.loadProfileImageFromCacheFileSystem($rootScope.user.localProfilePic);
                    }
                    fileWriter.write(dataBlob);

                }, function (err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_SAVE_64S_FILE} ${folderPath} ${err}`);
                });

            }, function (err) {
                log.logMessage(`${TAG} ${msgs.MSG_FAILED_SAVE_64S_FILE} ${folderPath} ${err}`);
            });

        }, function (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_SAVE_64S_FILE} ${folderPath} ${err}`);
        });
    }

    $scope.b64toBlob = function (b64Data, contentType, sliceSize) {
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

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_SAVE_64S_BLOB} ${err}`);
        }

        return new Blob(byteArrays, { type: contentType });
    }

    $scope.loadProfileImageFromCacheFileSystem = function (filename) {
        try {

            if (filename != undefined) {

                if ($scope.storageDirectory == "" || $scope.storageDirectory == undefined) {
                    $scope.initBaseDirectory();
                }

                var pathToFile = `${$scope.storageDirectory}images/${filename}`;

                window.resolveLocalFileSystemURL(pathToFile, function (fileEntry) {

                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                            $scope.updateProfileImage(true, this.result);
                        };
                        reader.readAsDataURL(file);

                    }, function (err) {
                        log.logMessage(`${TAG} ${msgs.MSG_FAILED_READ_FILE} ${err}`);
                    });

                }, function (err) {
                    log.logMessage(`${TAG} ${msgs.MSG_FAILED_READ_FILE} ${err}`);
                });
            }

        } catch (err) {
            log.logMessage(`${TAG} ${msgs.MSG_FAILED_READ_FILE} ${err}`);
        }
    }

})
