// define the class namespace
var puzzle = puzzle || thinkmaps.namespace("thinkmaps.puzzle");

// This is a singleton
puzzle.localization = (function () {

    // Globals
    var localizedStrings = {

        TIME:{
            "en": "Time: ",
            "de": "Zeit: "
        },
        CONGRATULATION:{
            "en": "Done! Your time was ",
            "de": "Geschafft! Zeit f&uuml;r die L&ouml;sung "
        }
    };

    return {
        get: function(key, language){
            return localizedStrings[key][language];
        }
    }
})();

