/**
 * Centralize valuable settings used across the app
 */
var configs = {};

configs.network = {

    BASE_URL_NOTIFICATIONS_API: "https://yns-api.herokuapp.com/api/",

    FIREBASE_CONFIGS: {
        apiKey: "AIzaSyBSb_lWe2uK4plfnSl-kHwIt06WVu-eywM",
        authDomain: "youpernotificationsystem.firebaseapp.com",
        databaseURL: "https://youpernotificationsystem.firebaseio.com",
        projectId: "youpernotificationsystem",
        storageBucket: "youpernotificationsystem.appspot.com",
        messagingSenderId: "189050028188"
    },

    TIMEOUT_WATCH_NOTIFICATIONS: 60000,

    init: function() {
        firebase.initializeApp(this.FIREBASE_CONFIGS);

        if (ionic.Platform.isIOS()) {
            this.BASE_URL_NOTIFICATIONS_API = this.BASE_URL_NOTIFICATIONS_API.replace("https", "http");
            this.FIREBASE_CONFIGS.databaseURL = this.this.FIREBASE_CONFIGS.databaseURL.replace("https", "http");
        }
    }

}

configs.files = {

    PREFIX_PROFILE_IMGS: "images/profile_",

    NAME_LOCAL_IMAGES_DIRECTORY: "images",
    IMGS_CONTENT_TYPE: "image/jpeg"

}

// Init configurations
configs.network.init();