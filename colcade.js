( function() {
"use strict";

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
  return this.columns.filter( function( column ) {
    var style = getComputedStyle( column );
    return style.display != 'none';
  });
};

// --------------------------  -------------------------- //

// public, updates activeColumns
proto.layout = function() {
  this.activeColumns = this.getActiveColumns();
  this._layout();
};

// private, does not update activeColumns
proto._layout = function() {
  // reset column heights
  this.columnHeights = this.activeColumns.map( function() {
    return 0;
  });
  // layout all items
  this.layoutItems( this.items );
};

proto.layoutItems = function( items ) {
  items.forEach( this.layoutItem, this );
};

proto.layoutItem = function( item ) {
  // layout item by appending to column
  var minHeight = Math.min.apply( Math, this.columnHeights );
  var index = this.columnHeights.indexOf( minHeight );
  this.activeColumns[ index ].appendChild( item );
  // at least 1px, if item hasn't loaded
  // we're adding both top and bottom margin here.
  // Not exactly accurate as they collapse, but it's cool
  var itemHeight = getOuterHeight( item ) || 1;
  this.columnHeights[ index ] += itemHeight;
};

// ----- adding items ----- //

proto.append = function( items ) {
  items = makeArray( items );
  // add items to collection
  this.items = this.items.concat( items );
  // lay them out
  this.layoutItems( items );
};

proto.prepend = function( items ) {
  items = makeArray( items );
  // add items to collection
  this.items = items.concat( this.items );
  // lay out everything
  this._layout();
};

// --------------------------  -------------------------- //

proto.onWindowResize = function() {
  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout( function() {
    this.onDebouncedResize();
  }.bind( this ), 100 );
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
  this.items.forEach( function( item ) {
    this.element.appendChild( item );
  }, this );
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
  attrParts.forEach( function( part ) {
    var pair = part.split(':');
    var key = pair[0].trim();
    var value = pair[1].trim();
    options[ key ] = value;
  });

  new Colcade( elem, options );
}

Colcade.data = function( elem ) {
  elem = getQueryElement( elem );
  var id = elem && elem.colcadeGUID;
  return id && instances[ id ];
};

// -------------------------- jQuery -------------------------- //

Colcade.makeJQueryPlugin = function( $ ) {
  $ = $ || window.jQuery;
  if ( !$ ) {
    return;
  }

  $.fn.colcade = function( arg0 /*, arg1 */) {
    // method call $().colcade( 'method', { options } )
    if ( typeof arg0 == 'string' ) {
      // shift arguments by 1
      var args = Array.prototype.slice.call( arguments, 1 );
      return methodCall( this, arg0, args );
    }
    // just $().colcade({ options })
    plainCall( this, arg0 );
    return this;
  };

  function methodCall( $elems, methodName, args ) {
    var returnValue;
    $elems.each( function( i, elem ) {
      // get instance
      var colcade = $.data( elem, 'colcade' );
      if ( !colcade ) {
        return;
      }
      // apply method, get return value
      var value = colcade[ methodName ].apply( colcade, args );
      // set return value if 
      returnValue = returnValue === undefined ? value : returnValue;
    });
    return returnValue !== undefined ? returnValue : $elems;
  }

  function plainCall( $elems, options ) {
    $elems.each( function( i, elem ) {
      var colcade = $.data( elem, 'colcade' );
      if ( colcade ) {
        // set options & init
        colcade.option( options );
        colcade._init();
      } else {
        // initialize new instance
        colcade = new Colcade( elem, options );
        $.data( this, 'colcade', colcade );
      }
    });
  }
};

// try making plugin
Colcade.makeJQueryPlugin();

// --------------------------  -------------------------- //

window.Colcade = Colcade;

})();
