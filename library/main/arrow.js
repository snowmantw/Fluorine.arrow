

// Modify Backbone style from use pure sting event to event object can go with data.
Notifier = {};
_.extend( Notifier, Backbone.Events );

// Callback:: (String, {'name': String...}) -> {'name': String...}
Notifier.on = function(name, callback){
    Backbone.Events.on.call(Notifier, name, callback);
}

// {'name': String...}
Notifier.trigger = function(note){
    Backbone.Events.trigger.call(Notifier, note.name, note);
}

Arrow = function(n_seq, p_seq){
    _.each(n_seq, function(waits){ waits.__triggered = []; 
                                   waits.__triggered.empty = function(){this.length = 0; } 
    } );

    this.n_seq = n_seq;
    this.p_seq = p_seq;

    // count down to zero if current triggered procs are all done.
    this.ipc = 0; 
}

// Note -> [ Note-> Note () ]
Arrow.one2many = function(n, ps){
    _.each(ps, function(p){
        Notifier.trigger(p(n));
    });
}

// [ Note ] -> [ Note-> Note () ]
Arrow.many2many = function(ns, ps){

    // maybe we can use other ways to optimize many2many.
    _.each(ns, function(n){
        Arrow.one2many(n,ps);
    });
}

/* Should we have many2one ? Composed handler should handle many-many by itself.
 *
// The original event triggering has no many2one machanism...
Arrow.many2one = function(ns, p){
    
    Notifier.trigger(p({'name': Arrow.concat_notes(ns), 'notes': ns}));
}

// [ Note ] -> Note
Arrow.concat_notes = function(ns){
    //return _.reduce(ns, function(memo_name, n){ return memo_name+'_'+n.name; }, "");
}
*/

// ([String], [Note]) -> [Note] OR []
Arrow.or = function(waits, triggers){

    var result = [];
    _.any( triggers, function(note) { 
            if( _.any( waits, function(name_w){ return note.name == name_w }) )
            {
                result.push(note);
                return true;
            }
    });

    return result;
}

// ([String], [Note]) -> [Note] OR []
Arrow.and = function(waits, triggers){

    var result = [];

    if( waits.length != triggers.length) { return result; }
    
    // if underscore optimized it's "difference" , this may improve performance.
    if( 0 == _.difference(waits, _.pluck(triggers, 'name')).length )
    {
        result = triggers;
    }

    return result;
}

// data of composed notes such as node_a AND node_b -> _a_b 
//   will put in 'data' field and can be identified by index.
//
// note : {'name': String, 'data': [ {... node N's data} ] }

//first:: a b c -> a (b, d) (c, d)
Arrow.prototype.first = function(arr){
    
    // return an new Arrow and_merge the pass-through callback and 'any' noty
    return new Arrow( Arrow.and_merge( arr.n_seq,( ['all'] ) )
                    , Arrow.and_merge( arr.p_seq,( [ function(note){
                            return note;
                      } ]))
                    );   
}

//(>>>):: a b c -> a c d -> a b d
Arrow.prototype.next = function(arr){
    
    return new Arrow( this.n_seq.concat( arr.n_seq ) ,
                      this.p_seq.concat( arr.p_seq ) 
                    );
}

//(***):: a b c -> a b' c' -> a (b, b') (c, c') 
Arrow.prototype.split = function(arr){
    
    return new Arrow( Arrow.and_merge(this.n_seq, arr.n_seq),
                      Arrow.and_merge(this.p_seq, arr.p_seq));
}


// run ONCE: every triggered processors should check 
//   if itself is the last one, and call bind function to bind next waits.
Arrow.prototype.run = function(){
    
    if( 0 == this.n_seq.length ) { return ; }
    var waits =  this.n_seq.shift(); // get first notes and processors.
    var procs = this.p_seq.shift();
    this.bind( waits, procs );
}

Arrow.prototype.wrap_p = function(p){
    var THIS = this;

    return function(){
        var result = p.apply({},arguments); 
        THIS.ipc --;

        // shift out current waits and procs to make next run.
        if( 0 == THIS.ipc) {
            THIS.run();
        }

        return result;
    };
}

// waits.__triggered is needed.
Arrow.prototype.bind = function(waits, procs){

    this.ipc = procs.length;

    var THIS = this;

    _.each(waits, function(wait){
        Notifier.on(wait, function(note){

            if( ! waits.__or ){ // is AND list.

                waits.__triggered.push(note);   // Only AND need to save triggered notes.

                // AND will trigger all events to all callback. 
                // check if all events match the waits.
                if( 0 != Arrow.and(waits, waits.__triggered ).length )
                {
                    // handle all events triggered.
                    Arrow.many2many(waits.__triggered,_.map( procs, THIS.wrap_p, THIS) );
                    waits.__triggered.empty();
                }

            } else { 
                if( 0 != Arrow.or(waits, [note]).length )
                {
                    // OR will only trigger one event to all callback.
                    Arrow.one2many(note, _.map( procs, THIS.wrap_p, THIS ) );
                    waits.__triggered.empty();
                }
            }
        });
    });
}

Arrow.and_merge = function(s1, s2){
    var zip = _.zip(s1, s2);

    // zip will cause undefined if s1.length != s2.length .
    var zip_noundef = [];
    if( s1.length != s2.length ){
        _.each(zip,function(es){
           var noundef = _.reject(es, function(e){
                return (e != undefined);
           });

           zip_noundef.push(noundef);
        });

        return _.flatten(zip_noundef);
    } else {
        return _.flatten(zip);
    }
}

