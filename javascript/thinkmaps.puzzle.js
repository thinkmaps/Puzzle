// define the class namespace
var thinkmaps = thinkmaps || {};

// handle the AMD
require([
    "dojo/parser",
    "dojo/_base/connect",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dojo/domReady!",
    "esri/map",
    "esri/arcgis/utils"
], function (parser, connect) {
    "use strict";

    parser.parse();
    thinkmaps.puzzle.init(connect);
});

// This is a singleton
thinkmaps.puzzle = (function (connect) {
    "use strict";

    // Globals
    var map,
        featureLayer,
        features,
        currentImage,
        successCount = 0,
        startTime = null,
        timeTimer,
        countryCount = 0,
        language = thinkmaps.localization.getCurrentLanguage(),
        timeString = "00:00";

    // Public methods
    return {

        init: function (connect) {

            var countries,
                countryLayer,
                mapDeferred,
                node;

            setTimeString();

            countries = new thinkmaps.puzzle.countries().getCountries();
            countryCount = countries.length;
            _initCountryTable(countries);

            esri.arcgis.utils.arcgisUrl = "http://www.arcgis.com/sharing/content/items";

            mapDeferred = esri.arcgis.utils.createMap("33b1e8c26e684e409a3a147f0ce333e8", "content");
            mapDeferred.addCallback(function (response) {
                map = response.map;
                connect.connect(map, "onExtentChange", function () {
                    if (map.getLevel() < 2) { map.setLevel(2); }
                    if (map.getLevel() > 6) { map.setLevel(6); }
                });
                var layers = response.itemInfo.itemData.operationalLayers;
                countryLayer = layers[0];
                features = countryLayer.featureCollection.layers[0].featureSet.features;
                featureLayer = countryLayer.featureCollection.layers[0].layerObject;
            });

            mapDeferred.addErrback(function () {
                console.log("Map creation failed!");
            });

            // Connect the drag and drop events
            node = document.getElementById("content");
            connect.connect(node, "dragenter", function (evt) {
                evt.preventDefault();
            });
            connect.connect(node, "dragover", function (evt) {
                evt.preventDefault();
            });
            connect.connect(node, "drop", _handleDrop);
        },

        setImage: function (image) {
            currentImage = image;
        },

        getImage: function () {
            return currentImage;
        },

        updateTimer: function () {
            if (startTime === null) {
                startTime = new Date();
                timeTimer = setInterval(_updateTimer, 1000);
            }
            successCount++;
            if (successCount === countryCount) {
                clearInterval(timeTimer);
                var div = document.getElementById("time");
                div.style.color = "#FFFF00";
                div.innerHTML = thinkmaps.puzzle.localization.get("CONGRATULATION", language) + timeString;
            }
        }
    };

    // Private methods
    function _updateTimer() {
        var nowTime = new Date();
        var difference = Math.ceil((nowTime.getTime() - startTime.getTime()) / 1000);
        var minutes = Math.ceil(difference / 60) - 1;
        var seconds = difference % 60;
        if (minutes <= 9) {
            minutes = "0" + String(minutes);
        }
        if (seconds <= 9) {
            seconds = "0" + String(seconds);
        }
        timeString = minutes + ":" + seconds;
        setTimeString();
    }

    function setTimeString(){
        document.getElementById("time").innerHTML = thinkmaps.puzzle.localization.get("TIME", language) + timeString;
    }

    function _initCountryTable(countries) {
        var t = "<div><table>",
            iso, name, i,
            internalCounter = 0;

        for (i = 0; i < countries.length; i++) {

            if (i % 4 === 0) { t += "<tr>"; }
            iso = countries[i].iso;
            name = countries[i][language];

            t += "<td><img src='Images/" + iso + ".png' id='" + iso;
            t+= "' onmousedown='thinkmaps.puzzle.setImage(this)' title='" + name + "'></td>";
            internalCounter++;

            if (internalCounter === 4) {
                t += "</tr>";
                internalCounter = 0;
            }
        }
        t += "</table></div>";
        document.getElementById("sidebar").innerHTML = t;
    }

    function _handleDrop(evt) {

        var i, point, feature, poly, polygon;

        if (evt.stopPropagation) {
            evt.stopPropagation(); // Stops some browsers from redirecting.
        }

        point = map.toMap(new esri.geometry.Point(evt.clientX - map.position.x, evt.clientY - map.position.y));
        for (i = 0; i < features.length; i++) {
            feature = features[i];
            poly = feature.geometry;
            polygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid: 102100}));
            polygon.rings = poly.rings;

            if (polygon.contains(point)) {
                var isoCode = feature.attributes.ISO_A2;
                if (isoCode.toLowerCase() === thinkmaps.puzzle.getImage().id.toLowerCase()) {
                    featureLayer.setEditable(true);
                    featureLayer.applyEdits(null, null, [feature]);
                    thinkmaps.puzzle.getImage().style.backgroundSize = "100%";
                    thinkmaps.puzzle.getImage().style.backgroundImage = "url(" + thinkmaps.puzzle.getImage().src + ")";
                    thinkmaps.puzzle.getImage().style.opacity = 0.6;
                    thinkmaps.puzzle.getImage().src = "images/right.png";
                    thinkmaps.puzzle.updateTimer();
                }
            }
        }
        evt.preventDefault();
        return false;
    }

})();
