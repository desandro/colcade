( function() {


var console = window.console;

function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

function getOuterHeight( elem ) {
  var style = getComputedStyle( elem );
  var marginTop = parseFloat( style.marginTop );
  var marginBottom = parseFloat( style.marginBottom );
  // set non-number values to 0, like auto
  marginTop = isNaN( marginTop ) ? 0 : marginTop;
  marginBottom = isNaN( marginBottom ) ? 0 : marginBottom;
  return elem.offsetHeight + marginTop + marginBottom;
}

function getQueryElement( elem ) {
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }
  return elem;
}

// globally unique identifiers
var GUID = 0;
// internal store of all Flickity intances
var instances = {};

// --------------------------  -------------------------- //

function Colcade( element, options ) {
  element = getQueryElement( element );
  if ( !element ) {
    if ( console ) {
      console.error( 'Bad element for Colcade: ' + ( element ) );
    }
    return;
  }

  this.element = element;
  // options
  this.options = extend( {}, this.constructor.defaults );
  this.option( options );
  // kick things off
  this.create();
}

Colcade.defaults = {};

var proto = Colcade.prototype;

proto.create = function() {
  // add guid for Colcade.data
  var guid = this.guid = ++GUID;
  this.element.colcadeGUID = guid;
  instances[ guid ] = this; // associate via id

  this.updateColumns();
  this.activeColumns = this.getActiveColumns();
  this.updateItemElements();
  this.layout();
  this._windowResizeHandler = this.onWindowResize.bind(this);
  window.addEventListener( 'resize', this._windowResizeHandler );
};

proto.option = function( options ) {
  this.options = extend( this.options, options );
};

proto.updateColumns = function() {
  var columns = this.element.querySelectorAll( this.options.columnSelector );
  this.columns = makeArray( columns );
};

proto.updateItemElements = function() {
  var itemElems = this.element.querySelectorAll( this.options.itemSelector );
  this.items = makeArray( itemElems );
};

proto.getActiveColumns = function() {
  var activeColumns = [];
  for ( var i=0, len = this.columns.length; i < len; i++ ) {
    var column = this.columns[i];
    var style = getComputedStyle( column );
    if ( style.display != 'none' ) {
      activeColumns.push( column );
    }
  }

  return activeColumns;
};

// --------------------------  -------------------------- //

proto.layout = function() {
  // reset column heights
  this.columnHeights = [];
  for ( var i=0, len = this.activeColumns.length; i < len; i++ ) {
    this.columnHeights.push(0);
  }
  // layout all items
  this.layoutItems( this.items );
};

proto.layoutItems = function( items ) {
  for ( var i=0, len = items.length; i < len; i++ ) {
    this.layoutItem( items[i] );
  }
};

proto.layoutItem = function( item ) {
  var minHeight = Math.min.apply( Math, this.columnHeights );
  var index = this.columnHeights.indexOf( minHeight );

  this.activeColumns[ index ].appendChild( item );
  // at least 1px, if item hasn't loaded
  // we're adding both top and bottom margin here.
  // Not exactly accurate as they collapse, but it's cool
  var itemHeight = getOuterHeight( item ) || 1;
  this.columnHeights[ index ] += itemHeight;
};

// --------------------------  -------------------------- //

proto.onWindowResize = function() {
  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout( function() {
    this.onDebouncedResize();
  }.bind(this), 100 );
};

proto.onDebouncedResize = function() {
  var activeColumns = this.getActiveColumns();
  if ( activeColumns == this.activeColumns ) {
    return;
  }
  // activeColumns changed
  this.activeColumns = activeColumns;
  this.layout();
};

// --------------------------  -------------------------- //

proto.destroy = function() {
  // move items back to container
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    var item = this.items[i];
    this.element.appendChild( item );
  }
  // remove events
  window.removeEventListener( 'resize', this._windowResizeHandler );
  // remove data
  delete this.element.colcadeGUID;
  delete instances[ this.guid ];
};

// -------------------------- HTML init -------------------------- //

document.addEventListener( 'DOMContentLoaded', function() {
  var elems = document.querySelectorAll('[data-colcade]');

  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    htmlInit( elem );
  }
});

function htmlInit( elem ) {
  // convert attribute "foo: bar, qux: baz" into object
  var attr = elem.getAttribute('data-colcade');
  var attrParts = attr.split(',');
  var options = {};
  for ( var i=0, len = attrParts.length; i < len; i++ ) {
    var part = attrParts[i];
    var pair = part.split(':');
    var key = pair[0].trim();
    var value = pair[1].trim();
    options[ key ] = value;
  }

  new Colcade( elem, options );
}

Colcade.data = function( elem ) {
  elem = getQueryElement( elem );
  var id = elem && elem.colcadeGUID;
  return id && instances[ id ];
};

// --------------------------  -------------------------- //

window.Colcade = Colcade;

})();
