import Complete from '@firstandthird/complete';
import { fire } from 'domassist';

const Events = {
  Geocoded: 'location:geocoded'
};

const Matching = {
  city: 'locality',
  state: 'administrative_area_level_1',
  country: 'country',
  country_iso: 'country'
};

class LocationSearch extends Complete {
  preInit() {
    let init = null;

    if (typeof window.initAutocomplete !== 'undefined') {
      init = window.initAutocomplete;
    }

    window.initAutocomplete = () => {
      this.onLoad();

      if (init) {
        init();
      }
    };

    // In case there's another function already declared, means that we have
    // more than one instance. No need to append the script twice
    if (init) {
      return;
    }

    window.addEventListener('load', () => {
      const script = document.createElement('script');
      let url = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=initAutocomplete';
      if (this.options.apikey) {
        url += `&key=${this.options.apikey}`;
      }
      script.src = url;
      document.head.appendChild(script);
    });
  }

  get required() {
    return {
      options: [],
      named: ['resultsContainer', 'input'],
      actions: ['search']
    };
  }

  get defaults() {
    return {
      types: '(regions)',
      minLength: 3,
      delay: 500,
      strict: true,
      showClass: 'show',
      highlightClass: 'selected',
      geocode: false,
      googleLogo: './img/light.png',
      googleAttributionClass: 'complete-google-attribution'
    };
  }

  onLoad() {
    this.service = new window.google.maps.places.AutocompleteService();

    if (this.options.geocode) {
      this.geocodeService = new window.google.maps.Geocoder();
    }
  }

  fetch() {
    if (!this.service) {
      return;
    }

    if (this.term.length < this.options.minLength) {
      return;
    }

    this.service.getPlacePredictions({
      input: this.term,
      types: this.options.types.split(','),
      language: 'en'
    }, (results) => {
      this.lastResults = {};
      let addresses = [];
      if (results) {
        addresses = results
          .filter(result => result.terms.length > 1)
          .map((result, index) => {
            this.lastResults[result.description] = result;
            return result.description;
          });
      }
      this.render(addresses);
      if (!this.options.googleLogo) {
        return;
      }
      const list = this.findOne('ul');
      list.insertAdjacentHTML('beforeend', `<li class="${this.options.googleAttributionClass}"><img src="${this.options.googleLogo}" alt="Powered by Google"/></li>`);
    });
  }

  updateValue(obj) {
    super.updateValue(obj);
    const location = this.lastResults[obj.value];
    this.locationSelected(location);

    if (this.options.geocode) {
      this.geocodeService.geocode(
        { address: this.selectedTerm.value },
        this.onLocationGeocoded.bind(this));
    }
  }

  getField(field, results, getShortName) {
    let result = null;
    const key = Matching[field];

    const filtered = results.address_components
      .filter(component => component.types.indexOf(key) > -1)[0];

    if (filtered) {
      result = getShortName === true ? filtered.short_name : filtered.long_name;
    }

    return result;
  }

  onLocationGeocoded([result]) {
    if (!result) {
      return;
    }

    const city = this.getField('city', result) || result.formatted_address;

    const detail = {
      place_id: result.place_id,
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
      country: this.getField('country', result),
      country_iso: this.getField('country', result, true),
      state: this.getField('state', result),
      city
    };

    fire(this.el, Events.Geocoded, { bubbles: true, detail });
  }

  locationSelected(location) {
    this.log(location);
  }
}

Complete.register('LocationSearch', LocationSearch);

export { Events, LocationSearch };
