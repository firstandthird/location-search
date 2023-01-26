# location-search ![npm](https://img.shields.io/npm/v/location-search.svg)

Javascript lib to add location autocomplete to a input box

## Update
  Added `place_id` field to `Events.Geocode` 

## Installation

```sh
npm i location-search
```

## Usage

### JavaScript

```js
@import 'location-search';
```

### HTML

```html
<link rel="stylesheet" href="node_modules/@firstandthird/complete/lib/complete.css"/>
<div data-module="LocationSearch" class="module-complete">
  <input data-name="input" type="text" id="location-search" data-action="search" data-action-type="input" />
  <div data-name="resultsContainer"></div>
</div>
```

### Attribution

[Google requires anyone using the places api show attribution.](https://developers.google.com/places/web-service/policies#logo_requirements)

By default location-search uses `./img/light.png`. This is the hidpi version so your css will need resize the image to 144px x 18px. There's also a `img/dark.png` available.

To change this, set the `googleLogo` option. This should be a path the browser can resolve. You can also set it to an empty string if you're going to display the logo elsewhere.
