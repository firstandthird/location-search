import Complete from '@firstandthird/complete';

class LocationSearch extends Complete {
  preInit() {
    window.initAutocomplete = () => {
      this.onLoad();
    };
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
      types: '(cities)',
      minLength: 3,
      delay: 500,
      strict: true,
      showClass: 'show',
      highlightClass: 'selected'
    };
  }

  onLoad() {
    this.loaded = true;
    this.service = new window.google.maps.places.AutocompleteService();
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
      types: this.options.types.split(',')
    }, (results) => {
      this.lastResults = {};
      const addresses = results.map((result, index) => {
        this.lastResults[result.description] = result;
        return result.description;
      });
      this.render(addresses);
    });
  }

  updateValue(obj) {
    super.updateValue(obj);
    const location = this.lastResults[obj.value];
    this.locationSelected(location);
  }

  locationSelected(location) {
    this.log(location);
  }
}

Complete.register('LocationSearch', LocationSearch);
export default LocationSearch;
