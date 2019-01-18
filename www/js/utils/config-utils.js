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

        if (ionic.Platform.isIOS()) {
            this.BASE_URL_NOTIFICATIONS_API = this.BASE_URL_NOTIFICATIONS_API.replace("https", "http");
            this.FIREBASE_CONFIGS.databaseURL = this.this.FIREBASE_CONFIGS.databaseURL.replace("https", "http");
        } else {
            firebase.initializeApp(this.FIREBASE_CONFIGS);
        }
    }

}

configs.files = {

    PREFIX_PROFILE_IMGS: "images/profile_",
    NAME_LOCAL_IMAGES_DIRECTORY: "images",
    IMGS_CONTENT_TYPE: "image/jpeg",
    PART_ID_AVATAR_PICS: "avatar",
    UPLOADED_IMGS_EXTENSION: ".jpg",

    getRandomInt : function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getUniqueId : function(len){
        var buf = [];
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charlen = chars.length;
        
        for (var i = 0; i < len; ++i) {
            buf.push(chars[this.getRandomInt(0, charlen - 1)]);
        }
        
        return buf.join('');
    },

    getLocalImgFilename: function(userEmail) {
        var localImgFile = `${userEmail.replace("@", "_")}_`;
        localImgFile += this.PART_ID_AVATAR_PICS;
        localImgFile += `_${this.getUniqueId(8)}`;
        localImgFile += this.UPLOADED_IMGS_EXTENSION;

        return localImgFile;
    }

}

// Init configurations
configs.network.init();