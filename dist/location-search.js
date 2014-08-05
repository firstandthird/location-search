/*!
 * location-search - Lib to add location autocomplete to a input box
 * v0.1.0
 * https://github.com/firstandthird/location-search
 * copyright First+Third 2014
 * MIT License
*/
/*!
 * fidel - a ui view controller
 * v2.2.5
 * https://github.com/jgallen23/fidel
 * copyright Greg Allen 2014
 * MIT License
*/
(function(w, $) {
  var _id = 0;
  var Fidel = function(obj) {
    this.obj = obj;
  };

  Fidel.prototype.__init = function(options) {
    $.extend(this, this.obj);
    this.id = _id++;
    this.namespace = '.fidel' + this.id;
    this.obj.defaults = this.obj.defaults || {};
    $.extend(this, this.obj.defaults, options);
    $('body').trigger('FidelPreInit', this);
    this.setElement(this.el || $('<div/>'));
    if (this.init) {
      this.init();
    }
    $('body').trigger('FidelPostInit', this);
  };
  Fidel.prototype.eventSplitter = /^(\w+)\s*(.*)$/;

  Fidel.prototype.setElement = function(el) {
    this.el = el;
    this.getElements();
    this.dataElements();
    this.delegateEvents();
    this.delegateActions();
  };

  Fidel.prototype.find = function(selector) {
    return this.el.find(selector);
  };

  Fidel.prototype.proxy = function(func) {
    return $.proxy(func, this);
  };

  Fidel.prototype.getElements = function() {
    if (!this.elements)
      return;

    for (var selector in this.elements) {
      var elemName = this.elements[selector];
      this[elemName] = this.find(selector);
    }
  };

  Fidel.prototype.dataElements = function() {
    var self = this;
    this.find('[data-element]').each(function(index, item) {
      var el = $(item);
      var name = el.data('element');
      self[name] = el;
    });
  };

  Fidel.prototype.delegateEvents = function() {
    if (!this.events)
      return;
    for (var key in this.events) {
      var methodName = this.events[key];
      var match = key.match(this.eventSplitter);
      var eventName = match[1], selector = match[2];

      var method = this.proxy(this[methodName]);

      if (selector === '') {
        this.el.on(eventName + this.namespace, method);
      } else {
        if (this[selector] && typeof this[selector] != 'function') {
          this[selector].on(eventName + this.namespace, method);
        } else {
          this.el.on(eventName + this.namespace, selector, method);
        }
      }
    }
  };

  Fidel.prototype.delegateActions = function() {
    var self = this;
    self.el.on('click'+this.namespace, '[data-action]', function(e) {
      var el = $(this);
      var action = el.attr('data-action');
      if (self[action]) {
        self[action](e, el);
      }
    });
  };

  Fidel.prototype.on = function(eventName, cb) {
    this.el.on(eventName+this.namespace, cb);
  };

  Fidel.prototype.one = function(eventName, cb) {
    this.el.one(eventName+this.namespace, cb);
  };

  Fidel.prototype.emit = function(eventName, data, namespaced) {
    var ns = (namespaced) ? this.namespace : '';
    this.el.trigger(eventName+ns, data);
  };

  Fidel.prototype.hide = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].hide();
      }
    }
    this.el.hide();
  };
  Fidel.prototype.show = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].show();
      }
    }
    this.el.show();
  };

  Fidel.prototype.destroy = function() {
    this.el.empty();
    this.emit('destroy');
    this.el.unbind(this.namespace);
  };

  Fidel.declare = function(obj) {
    var FidelModule = function(el, options) {
      this.__init(el, options);
    };
    FidelModule.prototype = new Fidel(obj);
    return FidelModule;
  };

  //for plugins
  Fidel.onPreInit = function(fn) {
    $('body').on('FidelPreInit', function(e, obj) {
      fn.call(obj);
    });
  };
  Fidel.onPostInit = function(fn) {
    $('body').on('FidelPostInit', function(e, obj) {
      fn.call(obj);
    });
  };
  w.Fidel = Fidel;
})(window, window.jQuery || window.Zepto);

(function($) {
  $.declare = function(name, obj) {

    $.fn[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      var options = args.shift();
      var methodValue;
      var els;

      els = this.each(function() {
        var $this = $(this);

        var data = $this.data(name);

        if (!data) {
          var View = Fidel.declare(obj);
          var opts = $.extend({}, options, { el: $this });
          data = new View(opts);
          $this.data(name, data); 
        }
        if (typeof options === 'string') {
          methodValue = data[options].apply(data, args);
        }
      });

      return (typeof methodValue !== 'undefined') ? methodValue : els;
    };

    $.fn[name].defaults = obj.defaults || {};

  };

  $.Fidel = window.Fidel;

})(jQuery);
/*!
 * complete - Autocomplete Plugin
 * v0.6.1
 * https://github.com/firstandthird/complete
 * copyright First+Third 2014
 * MIT License
*/
(function($){

  function escapeString (value) {
    return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  $.declare('complete',{
    defaults : {
      search : function(suggestion, queryOriginal, queryLowerCase){
        return this._getSuggestion(suggestion).toLowerCase().indexOf(queryLowerCase.toLowerCase()) !== -1;
      },
      listClass : 'complete',
      suggestionActiveClass : 'complete-active',
      suggestionClass : 'complete-suggestion',
      maxHeight : 142,
      minChars : 0,
      zIndex : 99999,
      delay : 300,
      allowOthers : false,
      sourceKey : null,
      showOnClick : true,
      keepOpen : false,
      formatSuggestion : function(suggestion, value){
        var pattern = '(' + escapeString(value) + ')';
        return this._getSuggestion(suggestion).replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>');
      },
      query : function(query, callback){
        var queryLower = query.toLowerCase(), self = this;

        var suggestions = $.grep(this.source, function(suggestion){
          return self.search(suggestion, query, queryLower);
        });

        callback.call(this,suggestions);
      }
    },
    events : {
      'keydown' : 'keyPressed',
      'keyup' : 'keyUp',
      'blur' : 'onBlur',
      'focus' : 'onFocus',
      'click' : 'valueChanged'
    },
    keyCode : {
      UP : 38,
      DOWN : 40,
      TAB: 9,
      ENTER : 13,
      ESC : 27
    },
    init : function(){
      $(this.el).attr('autocomplete', 'off');
      this.createListHolder();
      this.visible = false;
      this.currentValue = this.el.value;
      this.selectedIndex = -1;
      this.suggestions = [];
    },
    _getSuggestion : function (suggestion) {
      var value;

      if (!!this.sourceKey && suggestion && suggestion[this.sourceKey]){
        value = suggestion[this.sourceKey];
      }
      else {
        value = suggestion;
      }

      return value;
    },
    debounce : function(func) {
      var self = this;
      var args = arguments;

      if(this.delay > 0) {
        clearTimeout(this.debounceTimeout);

        this.debounceTimeout = setTimeout(function(){
          func.apply(self, args);
        }, this.delay);
      } else {
        func.apply(this, args);
      }
    },
    createListHolder : function(){
      var $el = $(this.el);
      this.listHolder = $('<div>').addClass(this.listClass).hide().insertAfter($el);
      this.list= $('<ul>');
      this.list.appendTo(this.listHolder);

      $(this.listHolder).css({
        "width" : $el.outerWidth(),
        "top" : $el.position().top + $el.outerHeight(),
        "left" : $el.position().left,
        "max-height" : this.maxHeight,
        "z-index" : this.zIndex
      });

      this.bindEventsList();
    },
    updatePosition: function() {
      var $el = $(this.el);
      $(this.listHolder).css({
        "top" : $el.position().top + $el.outerHeight(),
        "left" : $el.position().left
      });
    },
    bindEventsList : function(){
      var $list = $(this.list),
          self = this;
      $list.on('mouseover', 'li', function(e){
        var target = self._getTarget(e);
        self.activateSuggestion.apply(self, [target.data('index')]);
      });
      $list.on('mouseout', 'li', this.proxy(this.deActivateSuggestion,this));
      $list.on('click', 'li', this.proxy(this.selectSuggestion,this));
    },
    keyPressed : function(event){
      var propagate = true;
      switch(event.keyCode){
        case this.keyCode.UP :
          this._prevSuggestion();
          break;
        case this.keyCode.DOWN :
          this._nextSuggestion();
          break;
        case this.keyCode.ESC :
          this.el.val(this.currentValue);
          this.hide();
          break;
        case this.keyCode.TAB:
        case this.keyCode.ENTER:
          propagate = false;
          this.selectSuggestion(event);
          break;
        default:
          return;
      }

      if (!propagate) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    keyUp : function(event){
      switch(event.keyCode){
        case this.keyCode.UP :
        case this.keyCode.DOWN :
        case this.keyCode.ENTER:
          return;
      }
      this._generatedSuggestions = false;
      this.debounce(this.valueChanged);
    },
    onBlur : function(){
      $(document).on('click.complete', this.proxy(this.onClickWA,this));
    },
    onFocus: function() {
      this.updatePosition();
    },
    onClickWA : function(event){
      if (!this.keepOpen && $(event.target).closest('.' + this.listClass).length === 0) {
        this.hide();
        $(document).off('click.complete');
      } else {
        this.emit('complete:outsideclick');
      }
    },
    valueChanged : function(e){
      if (this._getSuggestion(this.currentValue) !== $(this.el).val() || (typeof e !== 'undefined' && this.showOnClick)){
        this.el.value = $.trim($(this.el).val());
        this.currentValue = this.el.value;
        this.selectedIndex = -1;

        if (this.currentValue.length >= this.minChars){
          this.show();
        }
        else {
          this.hide();
        }
      }
      this._generatedSuggestions = true;
    },
    _getSuggestions : function(query){
      var queryLower = query.toLowerCase(), self = this;

      return $.grep(this.source, function(suggestion){
        return self.search(suggestion, query, queryLower);
      });
    },
    _nextSuggestion : function(){
      var index = this.selectedIndex;

      if (!this.visible && this.currentValue){
        this.show();
      }
      else if (index !== (this.suggestions.length - 1)) {
        this._adjustPosition(index + 1);
      }
    },
    _prevSuggestion : function(){
      var index = this.selectedIndex;

      if (index !== -1) {
        this._adjustPosition(index -1);
      }
    },
    _adjustPosition : function(index){
      var selected = this.activateSuggestion(index),
          selTop, upperLimit, lowerLimit, elementHeight,
          listHolder = $(this.listHolder);

      if (selected){
        selTop = selected.offsetTop;
        upperLimit = listHolder.scrollTop();
        elementHeight = $(this.list).children().first().outerHeight();
        lowerLimit = upperLimit + this.maxHeight - elementHeight;

        if (selTop < upperLimit){
          listHolder.scrollTop(selTop);
        }
        else if (selTop > lowerLimit){
          listHolder.scrollTop(selTop - this.maxHeight + elementHeight);
        }

        $(this.el).val(this._getSuggestion(this.suggestions[index]));
      }
    },
    hide : function(){
      this.visible = false;
      $(this.listHolder).hide();
    },
    show : function(){
      var self = this;

      this.query.call(self, this.currentValue, function(suggestions){
        self.emit('complete:query', suggestions);
        if (suggestions && $.isArray(suggestions) && suggestions.length){
          self.visible = true;
          var value = self.currentValue,
              className = self.suggestionClass,
              html = '';

          self.suggestions = [];
          self.suggestions = suggestions;

          $.each(suggestions, function(i, suggestion){
            html += '<li class="'+ className +'" data-index="' + i +'">' + self.formatSuggestion(suggestion,value) + '</li>';
          });

          $(self.list).html(html);
          $(self.listHolder).show();
        }
        else {
          $(self.list).empty();
          self.suggestions = [];
          self.hide();
        }
      });
    },
    activateSuggestion : function(index){
      var classSelected = this.suggestionActiveClass,
          list = $(this.list);

      list.children('.' + classSelected).removeClass(classSelected);
      this.selectedIndex = index;

      if (index !== -1 && list.children().length > index){
        return $(list.children().get(index)).addClass(classSelected);
      }
    },
    deActivateSuggestion : function(e){
      this._getTarget(e).removeClass(this.suggestionActiveClass);
      this.selectedIndex = -1;
    },
    selectSuggestion : function(event){
      // If the user hits enter before the debounce finishes, we force a generation of the suggestions
      if(!this._generatedSuggestions){
        this.valueChanged();
      }

      if (event.type === "keydown" && this.allowOthers && this.selectedIndex < 0){
        var firstSuggestion = this._getSuggestion(this.suggestions[0]);

        if (this.suggestions.length === 1 && firstSuggestion === this.currentValue){
          this.currentValue = this.suggestions[0];
          $(this.el).val(this._getSuggestion(this.currentValue));
        }
        else {
          $(this.el).val(this.currentValue);
        }

        this.emit('complete:select',this.currentValue);
        this.hide();
      }
      else {
        if (this.selectedIndex === -1){
          this.selectedIndex = 0;
        }

        if (this.suggestions[this.selectedIndex]){
          $(this.el).val(this._getSuggestion(this.suggestions[this.selectedIndex]));
          this.currentValue = this.suggestions[this.selectedIndex];
          this.emit('complete:select',this.currentValue);
          this.hide();
        }
      }
    },
    _getTarget : function(e){
      return $(e.currentTarget || e.toElement);
    },
    setSource: function(source){
      this.source = source;
    }
  });
})(jQuery);

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
