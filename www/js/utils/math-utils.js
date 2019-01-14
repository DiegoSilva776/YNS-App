/**
 * Centralize valuable settings used across the app
 */
var math = {};

math.utils = {

    dhm: function(t) {
        var cd = 24 * 60 * 60 * 1000,
            ch = 60 * 60 * 1000,
            d = Math.floor(t / cd),
            h = Math.floor( (t - d * cd) / ch),
            m = Math.round( (t - d * cd - h * ch) / 60000),
            pad = function(n) {
                return n < 10 ? '0' + n : n; 
            };

        if (m === 60) {
            h++;
            m = 0;
        }

        if (h === 24) {
            d++;
            h = 0;
        }

        if (d > 0) {
            return `${d} days ${h} hours and ${m} minutes`;

        } else if (h > 0) {
            return `${h} hours and ${m} minutes`;

        } else if (m > 0) {
            return `${m} minutes`;
        }
    }

}