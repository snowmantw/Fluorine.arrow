



describe("Arrow#run", function(){

    it("try to trigger an Arrow composed by two OR list", function(){

        runs(function () {
            state = "";

            ws_1 = new Waits( [  new Wait('a', function(x){ state = 'a';  return {'name':'next'} } )
                              ,  new Wait('b', function(x){ state = 'b';  return {'name':'next'} } )
                              ,  new Wait('c', function(x){ state = 'c';  return {'name':'next'} } )
                              ] , true);

            ws_2 = new Waits( [  new Wait('d', function(x){ state = 'd';  return {'name':'next'} } )
                              ,  new Wait('e', function(x){ state = 'e';  return {'name':'next'} } )
                              ] , true);

            arrow = new Arrow([ws_1, ws_2]);

            arrow.run();

            Notifier.trigger({'name':'b'});
            Notifier.trigger({'name':'e'});
        });

        waits(500);

        runs(function () {
            expect(state).toEqual('e');
        });
    });
});

describe("Arrow#next", function(){

    it("try to trigger an Arrow composed by two Arrow, use 'next' ", function(){

        runs(function () {
            state = "";

            ws_1 = new Waits( [  new Wait('a', function(x){ state = 'a';  return {'name':'next'} } )
                              ,  new Wait('b', function(x){ state = 'b';  return {'name':'next'} } )
                              ,  new Wait('c', function(x){ state = 'c';  return {'name':'next'} } )
                              ] , true);

            ws_2 = new Waits( [  new Wait('d', function(x){ state = 'd';  return {'name':'next'} } )
                              ,  new Wait('e', function(x){ state = 'e';  return {'name':'next'} } )
                              ] , true);

            // arrow = new Arrow([ws_1, ws_2]);
            arr1 = new Arrow([ws_1]);
            arr2 = new Arrow([ws_2]);

            arrow = arr1.next(arr2);
            arrow.run();

            Notifier.trigger({'name':'b'});

        });

        waits(300);

        runs(function () {
            expect(state).toEqual('b');
            Notifier.trigger({'name':'e'});
        });

        waits(300);

        runs(function () {
            expect(state).toEqual('e');
        });
    });
});
