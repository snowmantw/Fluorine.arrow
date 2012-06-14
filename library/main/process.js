
// data Process = Process [Waits]

Process = function(w_seq){
    this.w_seq = w_seq;

    // For current bounded w_seq.
    this.__notes_triggered = [];
    this.__ipc = w_seq.length;
}

// class Process p where
//     step    :: p -> Process p'  -- pickup a waits and bind them.
//     run     :: p -> Process ()
//     reset   :: p -> Process p'
//
// Each process step will clear Notifier bindings.
// So it should use a separated Notifier.
Process.prototype.step = function(){

    // all waits had been executed.
    if( 0 == this.__ipc ) { return; }

    this.bind();

    this.__ipc --;
}


Process.prototype.reset = function(){
    this.__ipc = this.w_seq.length;
}

Process.prototype.run = function(){
    this.reset();
    this.step();
}

Process.prototype.bind = function(){

    var THIS = this;

      // take the first Waits to bind.

      // get the included Wait(s) in this Waits.
      _.each
      ( this.w_seq[0].waits
      , function(wait)
        {
            // bind each wait's name.
            // if it triggered, try if the waits is matched.
            // if waits matched, execute them and return result notes.
            Notifier.on
            (  wait.name()
            ,  function(note)
               {
                   THIS.__notes_triggered.push(note);
                   if(THIS.w_seq[0].match(THIS.__notes_triggered))
                   {
                       var notes_result = THIS.__execute_bind(note, THIS.w_seq[0], THIS.__notes_triggered);
                       THIS.__after_execute_bind(notes_result);
                   }
               }
            );  //Notifer.on
        }
      , this
      ) // each Waits.waits ( Wait )
}

// Note want to bind; notes_triggered -> notes_result
// Waits want to match ( if so, triggered it's result ) -> EventMonad [Note]
Process.prototype.__execute_bind = function(note, ws, notes_triggered){

    var result = [];

    result = ws.execute(notes_triggered);

    return result;
}

Process.prototype.__after_execute_bind = function(notes_result){
    // after execute, move head waits to tail.
    this.__cycle();
    this.__notes_triggered = [];    //reset.
    Notifier.off(); //clean all and bind new.
    this.step();
    _.each( notes_result, function(note){ Notifier.trigger(note); });
}


Process.prototype.__cycle = function(){
    var waits = this.w_seq.shift();

    // push back to save all waits, and use [0] index to point out current waits.
    this.w_seq.push(waits);

}    

