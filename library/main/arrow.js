

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


Wait = function(name, proc){
    this.name = name;
    this.proc = proc;
}

Wait.prototype.match = function(note){
    return note.name == this.name;
}

Wait.prototype.execute = function(note){
    return this.proc(note);
}

Waits = function(arr_wait){
    this.waits = arr_wait;
    this.notes_triggered = [];
    this.is_or = false;
}

//[Note] -> [Note]
Waits.prototype.execute = function(notes){

    var result = [];
    _.each( this.waits, function(wait) {
        _.each( notes, function(note){
            result.push(wait.execute(note));
        });
    });

    this.notes_triggered.length = 0;

    return result;
}

// :: Note -> [Note] OR []
Waits.prototype.match = function(note){

    if( this.is_or ){ return this.match_or(note);  }
    else            { return this.match_and(note); } 

}

// will return matched notes.
// OR will get only one matched.
// :: Note -> [Note] OR []
Waits.prototype.match_or = function(note){

    var result = [];

    _.any( this.notes_triggered, function(note) { 
            if( _.any( this.waits, function(wait){ return wait.match(node); } ))
            {
                result.push(note);
                return true;
            }
    });

    return result;
}

// :: Note -> [Note] OR []
Waits.prototype.match_and = function(note){

    var result = [];

    if( this.waits.length != this.notes_triggered.length) { return result; }
    
    // if underscore optimized it's "difference" , this may improve performance.
    if( 0 == _.difference(_.pluck(this.waits, 'name'), _.pluck(this.notes_triggered, 'name')).length )
    {
        result = this.notes_triggered;
    }

    return result;
}

Waits.prototype.trigger = function(note){
    this.notes_triggered.push(note);
}

//[ Waits ]
Arrow = function(w_seq){
    this.w_seq = w_seq;
    this.ipc = w_seq.length;
}

// Will called after every waits get done.
Arrow.prototype.run = function(){

    // all waits had been executed.
    if( 0 == this.ipc ) { return; }

    this.ipc --;

    var waits = this.w_seq.shift();
    this.bind(waits);

    // push back to save all waits, and use [0] index to point out current waits.
    this.w_seq.push(waits);
}

Arrow.prototype.reset = function(){

    this.ipc = this.w_seq.length;
}

// rerun == reset; run;
Arrow.prototype.rerun = function(){

    this.reset();
    this.run();
}

Arrow.prototype.bind = function(waits){

    var THIS = this;
    _.each( waits.waits , function(wait){
        Notifier.on( wait.name, function(note){
            waits.trigger(note);

            // check if match or not.
            var result_match = waits.match(note);
            if( 0 != result_match.length ){
                var notes_result = waits.execute(result_match);                
                _.each(notes_result, function(note){Notifier.trigger(note);});
                Notifier.off(wait.name);
                THIS.run();
            }
        }); // Notifier.on
    }); // _.each
}

//(>>>):: a b c -> a c d -> a b d
Arrow.prototype.next = function(arr){
    return new Arrow( this.w_seq.concat(arr.w_seq) );
}
