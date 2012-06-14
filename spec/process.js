
describe("Process", function(){

    describe("#step", function(){
        var state = "";
        subject = {};

        beforeEach(function(){
            state = "";
            subject = new Process(
                [  new Waits
                    (
                        [     
                              new Wait("a",function(note){ state = note.name; return {'name':'aext'}} )
                        ]
                    )
                ,  new Waits
                    (
                        [ 
                              new Wait("b",function(note){ state = note.name; return {'name':'bext'}} )
                            , new Wait("c",function(note){ state = note.name; return {'name':'cext'}} )
                            , new Or([ new Wait('d',function(note){state = note.name; return {'name': 'dext'} })
                                     , new Wait('e',function(note){state = note.name; return {'name': 'eext'} })
                                     ])
                        ]
                    )
                ,  new Waits
                    (
                        [ 
                              new Wait("f",function(note){ state = note.name; return {'name':'fext'}} )
                            , new Wait("g",function(note){ state = note.name; return {'name':'gext'}} )
                            , new Or([ new Wait('h',function(note){state = note.name; return {'name': 'hext'} })
                                     , new Wait('i',function(note){state = note.name; return {'name': 'iext'} })
                                     ])
                        ]
                    )
                ]);
        })

        it(" step #1: bind and trigger #1 step", function(){
            runs(function(){
                subject.run();
                Notifier.trigger({'name':'a'});
            });

            waits(500);

            runs(function(){
                expect(state).toEqual('a');

            });
        });

        it(" step #2: bind and trigger #2 step ( wrong order, not trigger )", function(){

            runs(function(){
                subject.run();
                Notifier.trigger({'name':'b'});
            });

            waits(500);

            runs(function(){
                expect(state).toEqual(""); // not changed: not match yet.
            });
        });

        it(" step #2: bind and trigger #2 step ( partial, not trigger )", function(){

            runs(function(){
                subject.run();
                Notifier.trigger({'name':'a'});
                Notifier.trigger({'name':'b'});
            });

            waits(500);

            runs(function(){
                expect(state).toEqual('a'); // not changed: not match yet.
            });
        });

        it(" step #2: bind and trigger #2 step", function(){

            runs(function(){
                subject.run();
                Notifier.trigger({'name':'a'});
                Notifier.trigger({'name':'b'});
                Notifier.trigger({'name':'c'});
                Notifier.trigger({'name':'e'});
            });

            waits(500);

            runs(function(){
                expect(state).toEqual('e');
            });
        });

        it(" step #3: bind and trigger #3 step; but do not trigger last Wait in OR", function(){

            runs(function(){
                subject.run();
                Notifier.trigger({'name':'a'});
                Notifier.trigger({'name':'b'});
                Notifier.trigger({'name':'c'});
                Notifier.trigger({'name':'e'});
                Notifier.trigger({'name':'f'});
                Notifier.trigger({'name':'g'});
                Notifier.trigger({'name':'h'});
                Notifier.trigger({'name':'i'});
            });

            waits(500);

            runs(function(){
                expect(state).toEqual('h');
                expect(state).not.toEqual('i');
            });
        });

    });
});
