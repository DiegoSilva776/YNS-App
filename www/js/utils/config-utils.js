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

    init: function() {
        firebase.initializeApp(this.FIREBASE_CONFIGS);
    }

}

configs.files = {

    PREFIX_PROFILE_IMGS: "images/profile_",

    NAME_LOCAL_IMAGES_DIRECTORY: "images",
    IMGS_CONTENT_TYPE: "image/jpeg"

}

// Init configurations
configs.network.init();