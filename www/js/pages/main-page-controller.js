// Ionic YNS App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'yns_app' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
  .module('YnsApp', [
    'ionic',
    'ngCordova',
    'YnsApp.NotificationsPresenter'
  ])

  .controller('MainPageController', function ($scope, $ionicModal, $cordovaCamera, $cordovaImagePicker, notificationsPresenter) {

    /**
     * Data that is bound to the UI
     */
    $scope.hasInitialized = false;
    $scope.isThereNewNotification = false;
    $scope.user = {
      email: "yns.user.1@email.com",
      name: "John Doe",
      profilePic: "...",
      latestNotification: "..."
    };
    $scope.notifications = [];

    /**
     * Classes and selectors
     */
    $scope.classes = {
      hidden: "hidden",
      shrink: "shrinked",
      reShrink: "re-shrinked",
      noNewMsgs: "no-new-msgs",
      withImg: "with-img"
    }

    $scope.selectors = {
      profileImgId: "profile-img",
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
      $scope.taskModal = modal;
    }, {
        scope: $scope,
        animation: 'scale-in'
      });

    $scope.openNotificationsModal = function () {
      $scope.taskModal.show();
    };

    $scope.closeNotificationsModal = function () {
      $scope.taskModal.hide();
      $scope.updateStatusNotifications();
    };

    $scope.expandListItem = function (idx) {
      var notification = $scope.getNotificationById(idx);

      if (notification !== null) {
        var notificationId = $scope.selectors.getNotificationId(idx);
        var notifShrinkIndicatorId = $scope.selectors.getNotificationShrinkId(idx);

        angular.element(document.querySelector(notificationId)).removeClass($scope.classes.shrink);
        angular.element(document.querySelector(notifShrinkIndicatorId)).addClass($scope.classes.hidden);
      }
    };

    $scope.getNotificationById = function (id) {

      for (var i = 0; i < $scope.notifications.length; i++) {
        var notification = $scope.notifications[i];

        if (notification.firebaseUid === id) {
          return notification;
        }
      }

      return null;
    };

    $scope.closeMsg = function (idx) {
      var notification = $scope.getNotificationById(idx);

      if (notification !== null) {
        notification.new = false;
        $scope.shrinkNotification(true, idx);
        $scope.upsertStatusUserNotification(notification);
      }
    };

    $scope.shrinkNotification = function (shrink, idx) {
      var notificationId = $scope.selectors.getNotificationId(idx);
      var el = document.querySelector(notificationId)

      if (shrink) {
        angular.element(el).addClass($scope.classes.reShrink);
      } else {
        angular.element(el).removeClass($scope.classes.reShrink);
      }
    }

    $scope.updateStatusNotifications = function () {
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

    $scope.showUnreadNotificatonIndicator = function (show) {

      if (show) {
        angular.element(document.querySelector($scope.selectors.notificationsImg)).removeClass($scope.classes.noNewMsgs);
        angular.element(document.querySelector($scope.selectors.newNotificationIndicator)).removeClass($scope.classes.hidden);
      } else {
        angular.element(document.querySelector($scope.selectors.notificationsImg)).addClass($scope.classes.noNewMsgs);
        angular.element(document.querySelector($scope.selectors.newNotificationIndicator)).addClass($scope.classes.hidden);
      }
    }
    // ./Notification's Modal

    /**
     * Connection to data services
     */
    $scope.initPresenters = function () {
      $scope.registerUserOnNotificationAPI();
      $scope.listenNewNotifications();
    }

    $scope.registerUserOnNotificationAPI = function () {
      notificationsPresenter.upsertUser($scope.user.email,
        $scope.user.name,
        $scope.user.profilePic,
        $scope.user.latestNotification)
        .then(function (user) {

          if (user) {
            $scope.user = user;
            $scope.getListNotifications($scope.user);
          } else {
            console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);
          }
        }).catch(function (err) {
          console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);
        });
    }

    $scope.listenNewNotifications = function () {
      try {
        var notificationsRef = firebase.database().ref("notifications/");
        notificationsRef.on('value', function (snapshot) {

          if ($scope.user.firebaseUid != undefined) {
            $scope.getListNotifications($scope.user)
          } else {
            $scope.registerUserOnNotificationAPI();
          }
        });
      } catch (err) {
        console.log(msgs.MSG_FAILED_LISTEN_NEW_NOTIFICATIONS + err);
      }
    }

    $scope.getListNotifications = function (user) {
      notificationsPresenter.getListNotifications(user)
        .then(function (updatedNotifications) {

          if (updatedNotifications) {
            $scope.notifications = updatedNotifications;

            for (var i = 0; i < $scope.notifications.length; i++) {
              $scope.notifications[i].receivedAt = new Date().toISOString();
            }

            $scope.updateStatusNotifications();
          } else {
            console.log(msgs.MSG_FAILED_LOAD_NOTIFICATIONS + err);
          }
        }).catch(function (err) {
          console.log(msgs.MSG_FAILED_LOAD_NOTIFICATIONS + err);
        });
    }

    $scope.upsertStatusUserNotification = function (notification) {
      notificationsPresenter.upsertUserNotification($scope.user,
        notification)
        .then(function (success) {

          if (success) {
            $scope.updateStatusNotifications();

            if (!$scope.isThereNewNotification) {
              $scope.closeNotificationsModal();
            }
          } else {
            console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);
          }
        }).catch(function (err) {
          console.log(msgs.MSG_FAILED_UPSERT_USER_NOTIFICATION_REL);
        });
    }

    if (!$scope.hasInitialized) {
      $scope.hasInitialized = true;
      $scope.initPresenters();
    }
    // ./Connection to data services

    /**
     * ImagePicker
     */
    $scope.imagesDirectory = "";

    document.addEventListener("deviceready", function () {

      $scope.openImagePicker = function () {

        $cordovaImagePicker.getPictures({
          maximumImagesCount: 10,
          width: 800,
          height: 800,
          quality: 80,
          outputType: window.imagePicker.OutputType.BASE64_STRING
        })
          .then(function (results) {

            for (var i = 0; i < results.length; i++) {
              var imgBase64Str = results[i];

              var imgFilename = `${$scope.user.firebaseUid}.jpg`;
              var cloudImgFilename = `${configs.files.PREFIX_STORAGE_PROFILE_IMGS}${imgFilename}`;
              var contentType = configs.files.IMGS_CONTENT_TYPE;

              var storageRef = firebase.storage().ref();
              var mountainImagesRef = storageRef.child(cloudImgFilename);

              mountainImagesRef.putString(imgBase64Str, 'base64').then(function (snapshot) {

                if (snapshot != undefined && snapshot != null) {

                  if (snapshot.state == "success") {
                    snapshot.ref.getDownloadURL().then(function (downloadURL) {
                      $scope.user.profilePic = downloadURL;
                      $scope.registerUserOnNotificationAPI($scope.user);
                      $scope.updateProfileImage(false, $scope.user.profilePic);
                      $scope.savebase64AsFile($scope.imagesDirectory, imgFilename, imgBase64Str, contentType);
                      $scope.readFile($scope.user.localProfilePic);
                    });
                  }
                }
              });
            }
          }, function (error) {
            console.log(msgs.MSG_FAILED_UPLOAD_PROFILE_PIC + error);
            $scope.adjustImgForAvatar(true);
          });
      }

      $scope.updateProfileImage = function (fromLocalStorage, imgUrlOrStrBase64) {
        
        if (fromLocalStorage) {
          document.getElementById($scope.selectors.profileImgId).src = imgUrlOrStrBase64;
        } else {
          angular.element(document.getElementById($scope.selectors.profileImgId)).attr("src", imgUrlOrStrBase64);
        }
        
        $scope.adjustImgForAvatar(false);
      }

      $scope.adjustImgForAvatar = function(adjustIt) {

        if (adjustIt) {
          angular.element(document.getElementById($scope.selectors.profileImgId)).removeClass($scope.classes.withImg);
        } else {
          angular.element(document.getElementById($scope.selectors.profileImgId)).addClass($scope.classes.withImg);
        } 
      }

      $scope.createDirectory = function () {
        var parentDirectory = cordova.file.externalRootDirectory;
        var directoryToCreate = configs.files.NAME_LOCAL_IMAGES_DIRECTORY;
        $scope.imagesDirectory = `${cordova.file.externalRootDirectory}${directoryToCreate}`;

        window.resolveLocalFileSystemURL(parentDirectory, function (dirEntry) {

          dirEntry.getDirectory(directoryToCreate, { create: true },
            function () {
              console.log(msgs.MSG_CREATED_IMGS_DIRECTORY);
            },
            function (err) {
              console.log(msgs.MSG_FAILED_CREATE_IMGS_DIRECTORY);
            });
        });
      }

      $scope.savebase64AsFile = function (folderPath, filename, base64, contentType) {
        var dataBlob = $scope.b64toBlob(base64, contentType);
        window.resolveLocalFileSystemURL(folderPath, function (dir) {

          dir.getFile(filename, { create: true }, function (file) {

            file.createWriter(
              function (fileWriter) {
                fileWriter.onwrite = function () {
                  $scope.user.localProfilePic = `${folderPath}/${filename}`;
                }
                fileWriter.write(dataBlob);
              }, function () {
                console.log('Unable to save file in path ' + folderPath);
              }
            );
          });
        });
      }

      $scope.b64toBlob = function (b64Data, contentType, sliceSize) {
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

        return new Blob(byteArrays, { type: contentType });
      }

      $scope.readFile = function (pathToFile) {
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

      $scope.initImagePicker = function () {
        $scope.createDirectory();
      }

      $scope.initImagePicker();

    }, false);

  })
  // ./ImagePicker

  
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
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
