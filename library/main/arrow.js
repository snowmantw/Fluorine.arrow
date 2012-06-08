
Notifier = {};
_.extend( Notifier, Backbone.Events );

Notifier.on = function(name, callback){
    

    Backbone.Events.on.call(Notifier, name, callback);
}

Arrow = function(first_n, first_p){
    first_n.__triggered = [];
    this.n_seq = [first_n];
    this.p_seq = [first_p];
}

// Note -> [ Note-> Note () ]
Arrow.one2many = function(n, ps){
    _.each(ps, function(p){
        var note = p(n);
        Notifier.trigger(p(n).name,note);
    });
}

// [ Note ] -> [ Note-> Note () ]
Arrow.many2many = function(ns, ps){

    // maybe we can use other ways to optimize many2many.
    _.each(ns, function(n){
        Arrow.one2many(n,ps);
    });
}

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

// note : {'name': String ...}

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
    
    return new Arrow( this.n_seq.concat(arr.n_seq),
                      this.p_seq.concat(arr.p_seq));
}

//(***):: a b c -> a b' c' -> a (b, b') (c, c') 
Arrow.prototype.split = function(arr){
    
    return new Arrow( Arrow.and_merge(this.n_seq, arr.n_seq),
                      Arrow.and_merge(this.p_seq, arr.p_seq));
}

// waits.__triggered is needed.
Arrow.prototype.run = function(){
    
    var THIS = this;
    _.each(this.n_seq, function(waits, idx){
        _.each(waits, function(wait){
            Notifier.on(wait, function(note){
                if( ! waits.__or ){ // is AND list.
                    
                    waits.__triggered.push(note);

                    // AND will trigger all events to all callback. 
                    // check if all events match the waits.
                    if( 0 != Arrow.and(waits, waits.__triggered ).length )
                    {
                        // handle all events triggered.
                        Arrow.many2many(waits.__triggered,THIS.p_seq[idx]);
                    }

                } else { 
                    if( 0 != Arrow.or(waits, [note]).length )
                    {
                        // OR will only trigger one event to all callback.
                        Arrow.one2many(note,THIS.p_seq[idx]);
                    }
                }
            });
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

