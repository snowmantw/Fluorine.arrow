

// data Waits = Waits [Wait]

Waits = function( ws ){
    this.waits = ws;

    // Cache. [ {'name',:name, 'wait': wait, 'note': note} ]
    this.__prev_matchs = [];

}


//
// class Waits ws where
//     match   :: ws -> [Note] -> Bool      -- will match strictly
//     execute :: ws -> [Note] -> [Note]
//     merge   :: ws -> ws -> ws
//     waits   :: ws -> [Wait]
//
// instance Waits Waits where

Waits.prototype.match = function(notes){
    // each note <-> each wait
    //

    return _.reduce
    ( this.waits
    , function(memo, wait)
      {
          var fnote = _.find
          ( notes
          , function( note )
            {
                if( wait.match(note) )
                {
                    this.__prev_matchs.push
                    ( {'name': note.name, 'wait':wait, 'note':note} );
                    return true;
                }
                return false;
            }
          , this 
          );

          // Bool && undefined -> false; other -> true
          return memo && ( undefined != fnote );
      }
    , true
    , this  // must specify context if we use any this keyword in body.
    );
}

Waits.prototype.execute = function(notes){

    // cache on.
    if( 0 == ( _.difference( 
        _.pluck(notes, 'name') , _.pluck(this.__prev_matchs, 'name') ).length), this)
    {
        var results = _.map
        ( this.__prev_matchs
        , function( o )
          {
              return o.wait.execute(o.note);
          }
        );

        return results;
    } 

    // if any note match the wait, 
    // execute it and put the result in result array.

    return _.reject
    (   _.map
        (   this.waits
        ,   function(wait)
            { 
                var nidx = _.find
                (  notes
                ,  function(note){ wait.match(note); }
                )
                return wait.execute(note);
            }
        ,   this
        )
    ,   function(result){ return undefined == result}
    ,   this
    );
}

Waits.prototype.merge = function(ws){
    return new Waits(this.waits.concat(ws.waits));
}

