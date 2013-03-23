// Source: http://elegantcode.com/2011/01/26/basic-javascript-part-8-namespaces/
var thinkmaps = thinkmaps || {};

thinkmaps.namespace = function (namespaceString) {

    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';

    for (var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }
    return parent;
};

// This is a singleton
thinkmaps.localization = (function () {

    var language = "en";

    return {
        redirectPage: function(pageName){
            _getLanguage();
            var parts = pageName.split(".");
            window.location.href = parts[0] + "_" + language + "." + parts[1];
        },
        getCurrentLanguage: function(){
            _getLanguage();
            return language;
        }
    };

    function _getLanguage(){
        // IE
        if (navigator.language === undefined){
            if (navigator.browserLanguage.indexOf("de") > -1) {
               language = "de";
            }
        } else {
            if (navigator.language.indexOf("de") > -1) {
                language = "de";
            }
        }
    }

})();