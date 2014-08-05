/*!
 * location-search - Lib to add location autocomplete to a input box
 * v0.1.0
 * https://github.com/firstandthird/location-search
 * copyright First+Third 2014
 * MIT License
*/
/*global google*/
$.fn.locationSearch = function(options) {
  options = options || {};

  var placeSearch = function(location, types, callback) {

    var service  = new google.maps.places.AutocompleteService(null);

    types = types || ['(cities)'];
    service.getPlacePredictions(
      { input: location, types: types },
      function(predictions, status) {
        if (status != 'OK') {
          return;
        }
        var locations = [];
        for (var i=0; i<5; ++i) {
          if (predictions[i]) {
            var p = predictions[i];
            locations.push({ place: p.description });
          }
        }
        callback(locations);
       }
     );
   };

   var geoLookup = function(place, callback) {
     var geocoder = new google.maps.Geocoder();

     geocoder.geocode( {'address': place }, function(results, status) {
       if (status != 'OK') {
         return callback(true);
       }
       var result = results[0];
       callback(null, {
         lat: result.geometry.location.k,
         lng: result.geometry.location.B,
         address: result.formatted_address,
         addressObj: result.address_components
       });
     });
   };

   return this.each(function() {
     var el = $(this);

     el
       .complete({
         keepOpen: true,
         sourceKey: 'place',
         query: function(query, callback) {
           var self = this;
           if (query !== '') {
             placeSearch(query, options.types, function(suggestions){
               callback.call(self, suggestions);
             });
           }
         }
       })
       .on('complete:select', function(e, val) {
         geoLookup(val.place, function(err, result) {
           el.trigger('location:select', result);
         });
       });
  });
};
