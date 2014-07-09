/*global google*/
$.fn.locationSearch = function(options) {
  options = options || {};

  function search(location, types, callback) {

    var service  = new google.maps.places.AutocompleteService(null);

    types = types || ['(cities)'];
    service.getPlacePredictions({ input: location, types: types },
      function(predictions, status) {
        if (status=='OK') {
          var locations = [];
          for (var i=0; i<5; ++i) {
            if (predictions[i]) {
              var p = predictions[i].description;
              locations.push({place: p});
             }
           }
           callback(locations);
         }
       }
     );
   }

   this.each(function() {
     var el = $(this);

     el.complete({
       sourceKey: 'place',
       query: function(query, callback) {
         var self = this;
         if (query !== '') {
           search(query, options.types, function(suggestions){
             callback.call(self, suggestions);
           });
         }
       }
    });
  });
};
