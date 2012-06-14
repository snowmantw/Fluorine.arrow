
describe("Waits", function(){

    describe("#match", function(){
        var state = "";
        var subject = {};
        var notes_match = [];
        var notes_not_match = [];

        beforeEach(function(){
            state = "";
            subject = new Waits
            (
                [ 
                      new Wait("a",function(note){ state = note.name; return {'name':'aext'}} )
                    , new Wait("b",function(note){ state = note.name; return {'name':'bext'}} )
                    , new Or([ new Wait('c',function(note){state = note.name; return {'name': 'cext'} })
                             , new Wait('d',function(note){state = note.name; return {'name': 'dext'} })
                             ])
                ]
            );
            
            // position inrelated
            notes_match     = [{'name': "d"}, {'name': "b"}, {'name': "a"}];
            notes_not_match = [{'name': "e"}, {'name': "b"}, {'name': "d"}];
        })

        it(" match a Waits with OR and normal Wait", function(){
              expect(subject.match(notes_match)).toEqual(true);
        });

        it(" NOT match a Waits with OR and normal Wait", function(){
              expect(subject.match(notes_not_match)).toEqual(false);
        });
    });

    describe("#execute", function(){
        var state = "";
        var subject = {};
        var notes_match = [];
        var result_notes_match = [];

        beforeEach(function(){
            state = "";
            subject = new Waits
            (
                [ 
                      new Or([ new Wait('a',function(note){state = note.name; return {'name': 'aext'} })
                             , new Wait('b',function(note){state = note.name; return {'name': 'bext'} })
                             ])
                    , new Wait("c",function(note){ state = note.name; return {'name':'cext'}} )
                    , new Wait("d",function(note){ state = note.name; return {'name':'dext'}} )
                    , new Or([ new Wait('e',function(note){state = note.name; return {'name': 'eext'} })
                             , new Wait('f',function(note){state = note.name; return {'name': 'fext'} })
                             ])
                ]
            );
            notes_match           = [{'name': "a"}, {'name': "c"}, {'name': "d"}, {'name': "f"}];
            result_notes_match    = [{'name': "aext"}, {'name':"cext"}, {'name': "dext"}, {'name': "fext"}];
        })

        it(" execute a Waits with OR and normal Wait", function(){
              expect(subject.match(notes_match)).toEqual(true);
              expect(subject.execute(notes_match)).toEqual(result_notes_match);
        });
    });
});

