# YNS App

YNS App is just an MVP used to display two features that make use of the YNS API:

  - > Allow the user to update the profile image, by selecting a picture on the images gallery and uploading this picture to a Cloud Storage solution as well as in the device.
  - > Create an in-app notification system that reads new notifications from a remote URL.

# Challenges I've encountered during development

  - > Solving the CORS issue:

The app wouldn't make requests to the original API endpoint at https://yns-api.herokuapp.com/api/, because the Headers to allow requests from all origins wasn't set. The app wouldn't run on the emulator either on the device. It only worked on localhost via 'ionic serve', if I enabled CORS with the plugin 'Allow CORS: Access-Control-Allow-Origin - Google Chrome'.

Initially I thought of building and running a release build on Android, however, it wouldn't be viable, because I must be able to debug the device with betters tools, such as Chrome Remote Device monitor and Safari's Web Inspector. So I tried to look for command line options to change the origin address on the requests from 'localhost:8080' to the actual device address on debug builds. I wasn't successful.

I searched to see if I would be able to add the headers on a server on Heroku. I thought it would have to be done via the project Dashboard, on Heroku admin panel, and I saw it wasn't possible.

Then I tried creating a proxy with Nginx, it worked fine on localhost, and I didn't have to use the Chrome extension anymore, however, the problem persisted on the emulator and the device.

SOLUTION

```
After some research, I figured it out that NodeJs allows me to add the Headers directly on the server, so I added the following function to my API configurations on NodeJS:

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, cache-control');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
		res.sendStatus(200);
    }
    else {
		next();
    }
};

// To solve CORS issue
app.use(allowCrossDomain);

I also had to add the proper headers on the requests made by the app:

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

and it finally worked! I was able to make requests to the API without getting blocked by CORS policies.
```
 
 - > Package names

Define a good package name at the begining of the project, because it can cause you trouble down the road in case you have to register your app in a service such as Firebase or any other Google service.

SOLUTION

```
I had the ionic starter package name, so I changed the package name on the root configuration file, removed the platform Android and iOS, re-added and rebuilt them. 
```

- > SSL Issues and trouble connecting directly from the app to the Storage and to the Firebase Web Socket, while using iOS

iOS stopped a few important requests, for instance to the storage where I had to save the profile picture of the user. So I tried disabling a few security options.

SOLUTION - Storage: 

```
Even disabling a few security options I still had trouble, so I decided to put the security configuration back and create an imageUpload endpoint on the API to proxy the creation of images on a Google Cloud Storage.

// On the app
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

// On the server
uploadImage: function (req, res) {
    try {
        var response = {
            status: evalUtils.STATUS_ERROR,
            data: {},
            msg: MSG_FAILED_GET_IMAGE_STORAGE
        };

        if (!evalUtils.hasErrors(req)) {
            var userEmail = evalUtils.cleanObj(req.body.userEmail);
            var filename = evalUtils.cleanObj(req.body.filename);
            var fileExtension = evalUtils.cleanObj(req.body.fileExtension);
            var base64String = req.body.base64String;

            userPersistence.findUser(userEmail, function(success, user) {

                if (success) {
                    storagePersistence.uploadImage(
                        user.firebaseUid,
                        filename,
                        fileExtension,
                        base64String,
                        function (success, image) {
        
                            if (success) {
                                response.status = evalUtils.STATUS_SUCCESS;
                                response.msg = MSG_SUCCESS;
        
                                if (evalUtils.isValidVal(image)) {
                                    response.data = image;
                                } else {
                                    response.data = {};
                                }
                            }
        
                            res.send(response);
                        }
                    );
                } else {
                    logUtils.logMessage(TAG, `${MSG_FAILED_GET_IMAGE_STORAGE}`);

                    response.status = evalUtils.STATUS_FAILED_INPUT;
                    response.data = MSG_INVALID_USER;

                    res.send(response);
                }
            });

        } else {
            logUtils.logMessage(TAG, `${MSG_FAILED_GET_IMAGE_STORAGE}`);

            response.status = evalUtils.STATUS_FAILED_INPUT;
            response.data = evalUtils.hasErrors(req);

            res.send(response);
        }

    } catch (err) {
        logUtils.logMessage(TAG, `${MSG_FAILED_GET_IMAGE_STORAGE} ${err}`);

        res.send(response);
    }
}
```

SOLUTION - In app notifications:

```
I believe the ideal solution would have been implementing a web socket on the server, in order to use Firebase services entirely inside the API. This would be good, because it would make a possible migration to another service, for instance, a custom solution with a MongoDB for Database,  AWS S3 for storage, and a custom web socket for notifications, seamless to the users. 

The API was built with a separation of concerns between the persistence and the logic layers, we could even implement a gradual migration process, where we would have a modified version of the API along with the older versions, Nginx or another load-balancer would distribute the traffic evenly to the Docker containers running all the versions, and the instances would write the new user data to the new persistence services. Then, we could run tests to ensure that the new versions of the API work properly on real data.

But, implementing this ideal solution would require a little bit more time, and as I believe I already used too much time to achieve the current version of the API and the App, I decided to implement a simpler solution:

On Android: Use the Firebase web socket to listen for new notifications in real time.

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

On iOS: Create a watcher that pulls the notifications from time to time and verifies if there is something new.

$rootScope.startNotificationsWatcher = function() {
    setTimeout(function() {
		 log.logMessage(`${TAG} ${msgs.MSG_START_NOTIFICATION_WATCHER} ${new Date()}`);

		 $rootScope.getListNotifications($rootScope.user);
		 $rootScope.startNotificationsWatcher();

	}, configs.network.TIMEOUT_WATCH_NOTIFICATIONS);
}
```

- > Local Storage

Firstly, I tried accessing the file system without a plugin, but the filesystems varied a lot depending on the OS. Then I tried setting an image as a base 64 encoded String on the browser's localStorage. It didn't work because the String was way too big and it wouldn't get stored completely.

SOLUTION

```
In order to store the images on the applications folder on the user device, I had to consider the different fylesystems and the paths of the application directory on each OS. I did it by using the plugin 'cordova-plugin-file' and worked.

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
```

- > Cached images

Ionic automatically caches webviews, so I ended up losing some time researching how to disable cache globally and on specific views. I didn't find an effective client-side solution for iOS 11.2. I tried: the following:

app.config(function($ionicConfigProvider){
	$ionicConfigProvider.views.maxCache(0);
});

$ionicHistory.clearCache()
.then(function () {
    $scope.loadProfilePicture(fromLocalStorage, imgUrlOrFile);
}).catch(function (err) {
    $scope.loadProfilePicture(fromLocalStorage, imgUrlOrFile);
});

SOLUTION

```
So, I decided to add a UID to the image filename sent by a user via the function 'storageService.uploadImg(...)', this way Ionic would be forced to ignore the cache because the new profile picture would have a different URL. The same logic was implemented locally. 

I understand that this approach has the downside of accumulating files locally and on the storage. However, a task can be created and integrated into a background service to clean the cloud storage and the local storage, in order to ensure there is only one profile image for each user. The creation of this services is possible because the filename of an image follows a standard that includes a user UID:

    On Android: "file:///data/user/0/com.diegomsilva.ynsapp/images/john.lenon_email.com_avatar_YBZTwaUM.jpg"

    On iOS    : "file:///Users/diego/Library/Developer/CoreSimulator/Devices/7F045624-FAAD-4D00-B430-87211BE866F7/data/Containers/Bundle/Application/CE36FAA9-549B-4191-9CD1-7D70F1E4079C/YNS%20App.app/images/john.lenon_email.com_avatar_a72oL0Qg.jpg"
 
    YNS - API: "profile_img_-LWNssH8BZ5NX1LKh9Ld_avatar_ZYHXIcHr_.jpg

    In order to receive the images on the imageUpload endpoint of the API, I had to increase the maximum payload size on the server:

    // Increase the maximum payload so we can receive the base 64 encoded images and send them to the Google Cloud Storage.
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
```

- > Automated testing on the YNS - API, https://github.com/DiegoSilva776/YNS-API

Inside the "app/" run "mocha" and you should get the following unit and integration tests. I still have to create End to End tests and improve the test cases, but I believe the current tests allowed me to progress on the development of the API with confidence.

```
DsMac:app diego$ mocha

		  Utils
		    getResponse
		      ✓ should get valid response object with the data attribute being the default value

		  Persistence
		    CRUD User
		1547812988381: UserPersistence Failed to find Users with the given input parameters or the User doesn't exist on the database
		1547812988388: UserPersistence Created User
		1547812988551: UserPersistence Failed to find Users with the given input parameters or the User doesn't exist on the database
		1547812988552: UserPersistence Created User
		1547812988717: UserPersistence Found User with the given input parameters
		1547812988883: UserPersistence Found Users with the given input parameters
		1547812989043: UserPersistence Found User with the given input parameters
		1547812989200: UserPersistence Deleted User with the given input parameters
		1547812989361: UserPersistence Found User with the given input parameters
		1547812989518: UserPersistence Deleted User with the given input parameters
		      ✓ Should upsert, find and delete Users (2726ms)
		    CRUD Notification
		1547812989680: NotificationPersistence Failed to find Notifications with the given input parameters or the notification doesn't exist on the database
		1547812989682: NotificationPersistence Created Notification
		1547812989843: NotificationPersistence Failed to find Notifications with the given input parameters or the notification doesn't exist on the database
		1547812989844: NotificationPersistence Created Notification
		1547812990011: NotificationPersistence Found Notification with the given input parameters
		1547812990177: NotificationPersistence Found Notifications with the given input parameters
		1547812990377: NotificationPersistence Found Notification with the given input parameters
		1547812990604: NotificationPersistence Deleted Notification with the given input parameters
		1547812990926: NotificationPersistence Found Notification with the given input parameters
		1547812991100: NotificationPersistence Deleted Notification with the given input parameters
		      ✓ Should upsert, find and delete Notifications (1581ms)
		    CRUD UserNotification
		1547812991260: UserPersistence Failed to find Users with the given input parameters or the User doesn't exist on the database
		1547812991261: UserPersistence Created User
		1547812991420: NotificationPersistence Failed to find Notifications with the given input parameters or the notification doesn't exist on the database
		1547812991422: NotificationPersistence Created Notification
		1547812991580: UserPersistence Found User with the given input parameters
		1547812991741: NotificationPersistence Found Notification with the given input parameters
		1547812991908: UserNotificationPersistence Failed to find UserNotifications with the given input parameters or the UserNotification doesn't exist on the database
		1547812991910: UserNotificationPersistence Created UserNotification
		1547812992082: UserNotificationPersistence Found UserNotification with the given input parameters
		1547812992243: UserNotificationPersistence Found UserNotifications with the given input parameters
		1547812992403: UserNotificationPersistence Found UserNotification with the given input parameters
		1547812992567: UserNotificationPersistence Deleted UserNotification with the given input parameters
		1547812992726: UserPersistence Found User with the given input parameters
		1547812992886: UserPersistence Deleted User with the given input parameters
		1547812993046: NotificationPersistence Found Notification with the given input parameters
		1547812993203: NotificationPersistence Deleted Notification with the given input parameters
		      ✓ Should upsert, find and delete UserNotifications (2102ms)

		  4 passing (6s)
```

- > Automated testing on Ionic and Angular

I'm learning how to create automated tests on Ionic/Angular with Jasmine and Protractor and I belive they will be available soon.

```
https://gonehybrid.com/how-to-write-automated-tests-for-your-ionic-app-part-2/
https://gonehybrid.com/how-to-write-automated-tests-for-your-ionic-app-part-3/
https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html
```

- > To build the Android and iOS projects, using the configuration files required by the Firebase native SDKs, please reach me out on the email available in my profile here on Github.
