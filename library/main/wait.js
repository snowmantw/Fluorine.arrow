
// data Wait  = Wait String (Note->Note)

Wait = function(n, act){
    this.n = n;
    this.act  = act;
}


//
// class Wait w where
//     match   :: w -> Note -> w Bool
//     execute :: w -> Note -> w Note
//     name    :: w -> String
//
// instance Wait Wait where

Wait.prototype.name  = function(){
    return this.n;
}

Wait.prototype.match = function(note){
    return note.name == this.n;
}

Wait.prototype.execute = function(note){

    // `act` must be a closure. No other contexts here.
    return this.act.call({},note);
}


