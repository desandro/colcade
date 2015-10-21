( function() {

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


var console = window.console;

function Colcade( element, options ) {
  if ( typeof element == 'string' ) {
    element = document.querySelector( element );
  }
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
  this.getColumns();
  this.activeColumns = this.getActiveColumns();
  this.getItemElements();
  this.layout();
  this._windowResizeHandler = this.onWindowResize.bind(this);
  window.addEventListener( 'resize', this._windowResizeHandler );
};

proto.option = function( options ) {
  this.options = extend( this.options, options );
};

proto.getColumns = function() {
  var columns = this.element.querySelectorAll( this.options.columnSelector );
  this.columns = makeArray( columns );
};

proto.getItemElements = function() {
  var itemElems = this.element.querySelectorAll( this.options.itemSelector );
  this.items = makeArray( itemElems );
};

proto.getActiveColumns = function() {
  var activeColumns = [];
  for ( var i=0, len = this.columns.length; i < len; i++ ) {
    var column = this.columns[i];
    var style = getComputedStyle( column );
    if ( style.display !== 'none' ) {
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
  var itemHeight = getSize( item ).outerHeight || 1;
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

// --------------------------  -------------------------- //

window.Colcade = Colcade;

})();
