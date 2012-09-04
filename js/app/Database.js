//Database Mixin

var Database=
{
    DB:null,
    init:function()  //must be called once at the begining of the application
    {
        //initialize objects for cross-platform compatibility
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    },
    //Open Database, needs db name
    open:function(dbName)  
    {
        console.log("Trying to open database ...");
        try {
            var dbOpenRequest = window.indexedDB.open(dbName,2); //open database and create one if nonexixtent
            dbOpenRequest.onsuccess = function(event) //onsucessful db opening
            {
                console.log("Opened database ...");
                Database.DB= dbOpenRequest.result;
            };
            dbOpenRequest.onupgradeneeded = function(e)  //Update Object store and indices
            {
                console.log("Database upgrade needed");
                var db = dbOpenRequest.result;
                var objectStore= db.createObjectStore("Images",{autoIncrement:true});
                objectStore.createIndex("name","name",{unique:true});
                console.log('Created Object Store');
            };
            dbOpenRequest.onerror = function(e){
                console.log("DB Open Request Error : " + e.value);
            };
            dbOpenRequest.onblocked = function(e){
                console.log("DB Open Request Blocked");
            };
        } catch (e) {
            console.log(e);
        }
    },
    //Method to add image,
    //Takes 3 arguments
    //img to add
    //function to execute on Image added successfully
    //function to execute on error
    addImage:function(img,onSuccess,onError)
    {
        console.log("Add Image to DB");
        //IDBTransaction.READ_WRITE deprecated
        var transaction= Database.DB.transaction(["Images"],"readwrite");
        transaction.onerror=onError;
        
        var objStore=transaction.objectStore("Images");
        var request=objStore.add(img);
        request.onsucess=onSuccess;
        request.onerror=onError;
    },
    //Method to retrieve all image,
    //Takes 1 arguments
    //function to execute on each Image retrieved
    getAllImages:function(onImgRetrieval)
    {
        var objStore=Database.DB.transaction("Images").objectStore("Images");
        objStore.openCursor(null,"prev").onsuccess=function(e)
        {
            var cursor=e.target.result;
            if(cursor)
            {
                onImgRetrieval(cursor.value);
                cursor.continue();
            }
        };
    },
    //Method to retrieve image by Key,
    //Takes 3 arguments
    //Key to search for
    //function to execute on Image retrieved
    //function to execute on Image not found
    getImageByKey:function(key,onImgRetrival,onNotFound)
    {
        var objStore=Database.DB.transaction("Images").objectStore("Images");
        var request=objStore.get(key);
        request.onsuccess=function(e)
        {
            console.log('Image Retrival Success');
            if(request.result)
                onImgRetrival(request.result.shapes);
            else
                onNotFound();
        };
    },
    //Retrieve an image by name
    //Takes 3 arguments
    //name to search for
    //function to execute on Image retrieved
    //function to execute on Image not found
    getImage:function(name,onImgRetrival,onNotFound)
    {
        var objStore=Database.DB.transaction("Images").objectStore("Images");
        var index=objStore.index("name");
        index.get(name).onsuccess=function(e)
        {
            console.log('Image Retrival Success');
            if(e.target.result)
                onImgRetrival(e.target.result.shapes);
            else
                onNotFound();
        };
    },
    //to retrieve the last n images saved to the database
    getnImage:function(n,onImgRetrieval)
    {
        console.log('Start');
        var objStore=Database.DB.transaction("Images").objectStore("Images");
        Database.getCount(function(e){
            
            var count=e.target.result;
            console.log("count is "+count);
            var bound;
            if(count>n)
                bound=IDBKeyRange.lowerBound(count-n,true);
            else
                bound=IDBKeyRange.lowerBound(0);
            console.log("start getting");
            //IDBCursor.PREV deprecated
            objStore.openCursor(bound,"prev").onsuccess=function(e)
            {
                var cursor=e.target.result;
                if(cursor)
                {
                    onImgRetrieval(cursor.value);
                    console.log(cursor.value.name);
                    cursor.continue();
                }
            };
            
        });
        
    },
    getCount:function(onGetCount) //get number of records
    {
        Database.DB.transaction("Images").objectStore("Images").count()
            .onsuccess=onGetCount;
    }
}

//Initialize and open Database
Database.init();
Database.open("myPaintDB");