# Colcade

_Lightweight masonry layout_

## Colcade vs. Masonry

[Masonry is great](http://masonry.desandro.com), but it has grown big as it has grown older. Colcade is designed to be small & fast. I recommend using Colcade over Masonry, but read over this feature comparison.

### Same features

+ Masonry grid layout
+ Works as a jQuery plugin or with vanilla JS
+ Initialize in HTML

### Better features

+ Much smaller. 1/8 the size of Masonry
+ Better fluid/responsive layout, using native browser positioning
+ One file, no dependencies, no package `dist` built file
+ Does not require [imagesLoaded when using images](http://masonry.desandro.com/layout.html#imagesloaded)

### Worse features

+ No multi-column-spanning items

```
OK                |  No
####  ####  ####  |  ##########  ####
####  ####  ####  |  ##########  ####
      ####        |
####        ####  |  ####  ##########
####  ####  ####  |  ####  ##########
####  ####  ####  |  ####
      ####        |
```

+ No built-in item transitions for [layout](http://masonry.desandro.com/methods.html#layout-masonry), [appending](http://masonry.desandro.com/methods.html#appended), [prepending](http://masonry.desandro.com/methods.html#prepended), or [removing](http://masonry.desandro.com/methods.html#remove)
+ No [stamps](http://masonry.desandro.com/options.html#stamp)
+ No [fitWidth centering](http://masonry.desandro.com/options.html#fitwidth)

## Install

Download: [colcade.js](https://npmcdn.com/colcade@0/colcade.js)

CDN:

``` html
<script src="https://npmcdn.com/colcade@0/colcade.js"></script>
```

[npm](https://www.npmjs.com/package/colcade): `npm install colcade`

Bower: `bower install colcade`

## Demos

+ [Basic, HTML init](http://codepen.io/desandro/pen/vGPVOR)
+ [jQuery](http://codepen.io/desandro/pen/vGPVOR)
+ [Vanilla JS](http://codepen.io/desandro/pen/EKMdjN)
+ [Images](http://codepen.io/desandro/pen/pyYxvz)

## Usage

Colcade works by moving item elements into column elements.

### HTML

``` html
<div class="grid">
  <!-- columns -->
  <div class="grid-col grid-col--1"></div>
  <div class="grid-col grid-col--2"></div>
  <div class="grid-col grid-col--3"></div>
  <div class="grid-col grid-col--4"></div>
  <!-- items -->
  <div class="grid-item">...</div>
  <div class="grid-item">...</div>
  <div class="grid-item">...</div>
  ...
</div>
```

### CSS

Sizing of the columns is handled by your own CSS. Change the number of columns by hiding or showing them.

``` css
/* Using floats */
.grid-col {
  float: left;
  width: 50%;
}

/* 2 columns by default, hide columns 2 & 3 */
.grid-col--2, .grid-col--3 { display: none }

/* 3 columns at medium size */
@media ( min-width: 768px ) {
  .grid-col { width: 33.333%; }
  .grid-col--2 { display: block; } /* show column 2 */
}

/* 4 columns at large size */
@media ( min-width: 1080px ) {
  .grid-col { width: 25%; }
  .grid-col--3 { display: block; } /* show column 3 */
}
```

[Edit float demo on CodePen](http://codepen.io/desandro/pen/EKMdxg)

``` css
/* with flexbox */
.grid {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}

.grid-col {
  -webkit-box-flex: 1;
  -webkit-flex-grow: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
}

/* 2 columns by default, hide columns 2 & 3 */
.grid-col--2, .grid-col--3 { display: none }

/* 3 columns at medium size */
@media ( min-width: 768px ) {
  .grid-col--2 { display: block; } /* show column 2 */
}

/* 4 columns at large size */
@media ( min-width: 1080px ) {
  .grid-col--3 { display: block; } /* show column 3 */
}
```

[Edit flexbox demo on CodePen](http://codepen.io/desandro/pen/RadeWy)

### Initialize Colcade

Set selectors for column and item elements in the options.

With jQuery. [Edit jQuery demo on CodePen](http://codepen.io/desandro/pen/vGPVOR)

``` js
$('.grid').colcade({
  columns: '.grid-col',
  items: '.grid-item'
})
```

With vanilla JS. [Edit vanilla JS demo on CodePen](http://codepen.io/desandro/pen/EKMdjN)

``` js
// element as first argument
var grid = document.querySelector('.grid');
var colc = new Colcade( grid, {
  columns: '.grid-col',
  items: '.grid-item'
});

// selector string as first argument
var colc = new Colcade( '.grid', {
  columns: '.grid-col',
  items: '.grid-item'
});
```

With HTML. [Edit HTML demo on CodePen](http://codepen.io/desandro/pen/EKMdxg)

``` html
<div class="grid" data-colcade="columns: .grid-col, items: .grid-item">
  ...
</div>
```

## Methods

### append

Add items to end of layout.

``` js
// jQuery
$grid.colcade( 'append', items )
// vanilla JS
colc.append( items )
```

### prepend

Add items to beginning of layout.

``` js
// jQuery
$grid.colcade( 'prepend', items )
// vanilla JS
colc.prepend( items )
```

### destroy

Remove Colcade behavior completely.

``` js
// jQuery
$grid.colcade('destroy')
// vanilla JS
colc.destroy()
```

---

By David DeSandro

MIT License. Have at it.
