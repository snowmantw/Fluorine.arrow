
// OR List == Wait
//
//

//
// class Arrow a where
//     next    :: a b c -> a c d   -> a b d
//     split   :: a b c -> a b' c' -> a (b,b') (c,c')
//






/*

Wait = function(name, proc){
    this.name = name;
    this.proc = proc;
}

Wait.prototype.match = function(note){
   if(note.name == this.name)
   {
        return [note];
   }
   return [];
}

// Note -> [Note]
Wait.prototype.execute = function(note){
    return this.proc(note);
}

Waits = function(arr_wait, set_or){
    this.waits = arr_wait;
    this.notes_triggered = [];
    this.is_or = set_or || false;
}

// Will treat OR lists as single element.
// This require Waits and Waits has the same interface !
//
//    [1,2,3,4] [5.6.7] -> [1,2,3,4,[5.6.7]] [8,9] -> [1,2,3,4,[5.6.7],8,9] [10.11] 
//
Waits.merge = function( ws1, ws2 ){

    var ntr1 = ws1.notes_triggered;
    var ntr2 = ws2.notes_triggered;

    var ww1 = ws1.waits;
    var ww2 = ws2.waits;

    if(ws1.is_or == ws2.is_or)
    {
        var arr_wait = ww1.concat(ww2);
        var waits = new Waits(arr_wait, ws1.is_or);
        waits.notes_triggered = ntr1.concat(ntr2);
        return waits;
    }

    var wwor = ws1.is_or ? ws1.waits : ws2.waits;
    var wwand = ws1.is_or ? ws2.waits : ws1.waits;

    wwand.push(wwor);
    var waits = new Waits(wwand, wwand.is_or);
    waits.notes_triggered = ntr1.concat(ntr2);
    return waits;
}

Waits = function(arr_wait, set_or){
    this.waits = arr_wait;
    this.notes_triggered = [];
    this.is_or = set_or || false;
}

// [Note] -> [Note] || Note -> [Note] ( keep same with Wait::execute ) 
// special note: NOT use "powerset" style execution,
// because (***):: a b c -> a b' c' -> a (b, b') (c, c')
//
Waits.prototype.execute = function(notes){
    if(! _.isArray(notes)){ notes = [notes]; }

    var result = [];
    _.each( this.waits, function(wait) {
        var note_to_exec = 
        _.find(notes, function(note){
            return note.name == wait.name
        });
        
        if( note_to_exec ){
            result.push(wait.execute(note_to_exec));
        }
    });

    this.notes_triggered.length = 0;

    return result;
}

// TODO: interface....
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
    var waits = this.waits;

    _.any( this.notes_triggered, function(note) { 
            if( _.any( waits, function(wait){ return wait.match(note); } ))
            {
                result.push(note);
                return true;
            }
            else { return false };
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
Arrow.prototype.step = function(){

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

// rerun == reset; step;
Arrow.prototype.run = function(){

    this.reset();
    this.step();
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
                THIS.step();
            }
        }); // Notifier.on
    }); // _.each
}

//(>>>):: a b c -> a c d -> a b d
Arrow.prototype.next = function(arr){
    return new Arrow( this.w_seq.concat(arr.w_seq) );
}

///(***):: a b c -> a b' c' -> a (b, b') (c, c')
Arrow.prototype.split = function(arr){

}
*/
