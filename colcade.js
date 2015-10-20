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

Colcade.prototype.create = function() {
  this.getColumns();
  this.getItemElements();
  this.resetLayout();
  window.addEventListener( 'resize', this.onWindowResize.bind(this) );
};

Colcade.prototype.option = function( options ) {
  this.options = extend( this.options, options );
};

Colcade.prototype.getColumns = function() {
  var columns = this.element.querySelectorAll( this.options.columnSelector );
  this.columns = makeArray( columns );
};

Colcade.prototype.getItemElements = function() {
  var itemElems = this.element.querySelectorAll( this.options.itemSelector );
  this.items = makeArray( itemElems );
};

Colcade.prototype.resetLayout = function( activeColumns ) {
  this.activeColumns = activeColumns || this.getActiveColumns();
  // this.colCount = this.activeColumns.length;
  // reset column heights
  this.columnHeights = [];
  for ( var i=0, len = this.activeColumns.length; i < len; i++ ) {
    this.columnHeights.push(0);
  }

  this.layout();
};

Colcade.prototype.getActiveColumns = function() {
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

Colcade.prototype.layout = function() {
  this.append( this.items );
};

Colcade.prototype.append = function( items ) {
  for ( var i=0, len = items.length; i < len; i++ ) {
    this.appendItem( items[i] );
  }
};

Colcade.prototype.appendItem = function( item ) {
  var minHeight = Math.min.apply( Math, this.columnHeights );
  var index = this.columnHeights.indexOf( minHeight );

  this.activeColumns[ index ].appendChild( item );
  // at least 1px, if item hasn't loaded
  var itemHeight = getSize( item ).outerHeight || 1;
  this.columnHeights[ index ] += itemHeight;
};

// --------------------------  -------------------------- //

Colcade.prototype.onWindowResize = function() {
  clearTimeout(this.resizeTimeout);
  this.resizeTimeout = setTimeout( function() {
    this.onDebouncedResize();
  }.bind(this), 100 );
};

Colcade.prototype.onDebouncedResize = function() {
  console.log('debounce resize');
  var activeColumns = this.getActiveColumns();
  if ( activeColumns == this.activeColumns ) {
    return;
  }
  // activeColumns changed
  this.resetLayout( activeColumns );
};

// --------------------------  -------------------------- //

window.Colcade = Colcade;

})();
