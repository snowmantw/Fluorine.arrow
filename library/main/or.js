
// data Or = Or [Wait] (Note->Note)

Or = function(waits){
    this.waits = waits;

    // Cache.
    this.__prev_match = 
    { 'note': {'name': ""}, 'wait': null };
}

//
// class Wait w where
//     match   :: w -> Note -> w Bool
//     execute :: w -> Note -> w Note
//
// instance Wait Wait where

// will make a folded name.
Or.prototype.name  = function(){
    return _.reduce
    ( this.waits
    , function(memo, wait)
      {
          return memo+'|'+wait.name();
      }
    , ""
    , this 
    );
}

Or.prototype.match = function(note){

    this.__prev_match.note  = note
    this.__prev_match.wait  = _.find
    (  this.waits
    ,  function(wait){ return wait.match(note) } 
    ,  this
    );

    return ( null != this.__prev_match.wait )
}

Or.prototype.execute = function(note){

    var wait = null;

    if(   note.name == this.__prev_match.note.name 
      &&  null != this.__prev_match.wait 
      )
    {
        wait = this.__prev_match.wait;
    }
    else
    {
        wait = _.find
        ( this.waits
        , function( wait ){ return wait.name() == note.name; }
        , this
        );
    }

    // should find: match should be called before.
    return wait.act.call({}, note);
}
