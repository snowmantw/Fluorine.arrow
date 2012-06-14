

describe("Or",function(){
    describe("#match", function(){
        var state = "";
        var subject = {};

        beforeEach(function(){
            state = "";
            subject = new Or([ new Wait('a',function(note){state = note.name; return {'name': 'aext'} })
                             , new Wait('b',function(note){state = note.name; return {'name': 'bext'} })
                             ]);
        });

        it(" match some note.",function(){
            expect(subject.match({'name':'a'})).toEqual(true);   
            expect(subject.match({'name':'b'})).toEqual(true);   
            expect(subject.match({'name':'c'})).toEqual(false);   
        });
    });

    describe("#execute", function(){
        beforeEach(function(){
            state = "";
            subject = new Or([ new Wait('a',function(note){state = note.name; return {'name': 'aext'} })
                             , new Wait('b',function(note){state = note.name; return {'name': 'bext'} })
                             ]);
        });

        it(" exec some note.",function(){
            expect(subject.execute({'name':'a'})).toEqual({'name':'aext'});   
            expect(subject.execute({'name':'b'})).toEqual({'name':'bext'});   
            expect(state).toEqual('b');
        });

    });
});
