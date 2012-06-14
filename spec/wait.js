
describe("Wait",function(){
    describe("#match", function(){
        var state = "";
        var subject = [];

        beforeEach(function(){
            state = "";
            subject = 
            [ 
                  new Wait("a",function(note){ state = note.name; return {'name':'aext'}} )
                , new Wait("b",
                     function(note){ 
                         state = note.name; 
                         return {'name':'bext'}} )
            ];
        });

        it(" match some note.",function(){
            expect(subject[0].match({'name':'a'})).toEqual(true);   
            expect(subject[1].match({'name':'b'})).toEqual(true);   
            expect(subject[1].match({'name':'c'})).toEqual(false);   
        });
    });
});
