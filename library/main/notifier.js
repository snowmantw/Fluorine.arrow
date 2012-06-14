

// Modify Backbone style from use pure sting event to event object can go with data.
Notifier = {};
_.extend( Notifier, Backbone.Events );

// Callback:: (String, {'name': String...}) -> {'name': String...}
// name can be "a|b|c|d" : auto separation and bind ( OR ).
// TODO: This is a tricky way. Need to be refactoring.
Notifier.on = function(name, callback){

    var ns = name.split('|');
    if( "" == ns[0] ) {
        ns.shift();
    }
    _.each(ns, function(name){
        Backbone.Events.on.call(Notifier, name, callback);
    });
}

// {'name': String...}
Notifier.trigger = function(note){
    Backbone.Events.trigger.call(Notifier, note.name, note);
}
