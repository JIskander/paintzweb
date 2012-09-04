//Remove function, to remove an element from an array
Array.prototype.remove=function(elem)
{
    var newAr=[];
    this.each(function(e){
            if(e!=elem)
                newAr.push(e);
        });
    return newAr;
};

//Mediator class acts as the controller
//communication link between UI and other classes.
var Paint=
{
    init: function() // must be called once at the begining
    {
        this.msg=$('msg');
        this.canvas=$('canvas');
        this.context=Paint.canvas.getContext('2d');
        this.context.fillStyle='white';
        this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.color=[0,0,0];
        this.shape='FreeHand';
        this.shapeToDraw=new CompositeShape([]);
        this.redoShapes=[];
        this.lineWidth=1;
        this.isDrawing=false;
        this.historyPoints=[];
        this.oldShape;  
    },
    //setters
    setLineWidth:function(lineWidth)
    {
        this.lineWidth=lineWidth;
    },
    setColor:function(rgb)
    {
        this.color=rgb;
    },
    setShape:function(shape)
    {
        this.shape=shape;
    },
    //mouse events
    mousedown:function(e)
    {
        Paint.isDrawing=true;
        Paint.startPoint=new Point(e.pageX-this.offsetLeft,e.pageY-this.offsetTop);
        Paint.historyPoints.push(Paint.startPoint);
    },
    mousemove:function(e)
    {   
        if(Paint.isDrawing)
        {
            var p1=new Point(e.pageX-this.offsetLeft,e.pageY-this.offsetTop);
            var pp=Paint.historyPoints.pop();
            var newshape;
            switch (Paint.shape)
            {
                case 'Circle':
                    newshape=new Circle(Paint.startPoint,0);
                    newshape.setRadius(p1);
                    newshape.setLineWidth(Paint.lineWidth);
                    newshape.setColor(Paint.color);
                    break;
                case 'FillCircle':
                    newshape=new Circle(Paint.startPoint,0);
                    newshape.setRadius(p1);
                    newshape.isFill=true;
                    newshape.setLineWidth(Paint.lineWidth);
                    newshape.setColor(Paint.color);
                    break;
                case 'Rectangle':
                    var width=p1.x-Paint.startPoint.x;
                    var height=p1.y-Paint.startPoint.y;
                    newshape=new Rectangle(Paint.startPoint,width,height);
                    newshape.setLineWidth(Paint.lineWidth);
                    newshape.setColor(Paint.color);
                    break;
                case 'FillRectangle':
                    var width=p1.x-Paint.startPoint.x;
                    var height=p1.y-Paint.startPoint.y;
                    newshape=new Rectangle(Paint.startPoint,width,height);
                    newshape.setLineWidth(Paint.lineWidth);
                    newshape.setColor(Paint.color);
                    newshape.isFill=true;
                    break;
                default:  //Free Hand
                    newshape=new Shape();
                    newshape.points=Paint.historyPoints;
                    newshape.points.push(p1);
                    if(Paint.oldShape)
                        newshape.points.push(Paint.oldShape.points.pop());
                    newshape.points.push(p1);    
                    newshape.setLineWidth(Paint.lineWidth);
                    newshape.setColor(Paint.color);   
            }
            if (Paint.oldShape)
            {
                Paint.shapeToDraw.shapes=Paint.shapeToDraw.shapes.remove(Paint.oldShape); 
            }
            Paint.oldShape=newshape;
            Paint.shapeToDraw.shapes.push(Paint.oldShape);
            Paint.draw();
        }
    },
    mouseup:function(e)
    {
        Paint.isDrawing=false;
        Paint.oldShape=undefined;
        Paint.historyPoints=[]; //is there a better way to empty array
    },
    
    //Canvas related operations
    draw:function()
    {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.shapeToDraw.draw();
    },
    clearCanvas:function()
    {
        Paint.context.clearRect(0,0,Paint.canvas.width,Paint.canvas.height);
        Paint.shapeToDraw.shapes.clear();
    },
    saveCanvas:function(name)
    {
        Paint.shapeToDraw.name=name;
        Database.addImage(Paint.shapeToDraw,
                          function(){Paint.showMessage("Image Saved");},
                          function(){Paint.showMessage("Problem in saving. Try another file name.");});
        Paint.showMessage('Image Saved'); 
    },
    downloadCanvas:function()
    {
        var img=$('canvas').toDataURL('image/png');
        var win=window.open();
        win.document.write("<img src='"+img+"' />");
    },
    undo:function()
    {
        if(Paint.shapeToDraw.shapes.length>0)
        {
            Paint.redoShapes.push(Paint.shapeToDraw.shapes.pop());
            Paint.context.clearRect(0,0,Paint.canvas.width,Paint.canvas.height);
            Paint.shapeToDraw.draw();
        }
    },
    redo:function()
    {
        if(Paint.redoShapes.length>0)
        {
            Paint.shapeToDraw.shapes.push(Paint.redoShapes.pop());
            Paint.context.clearRect(0,0,Paint.canvas.width,Paint.canvas.height);
            Paint.shapeToDraw.draw();
        }
    },
    //Database related operations
    openImage:function(name)
    {
        Paint.clearCanvas();
        Database.getImage(name, function(shapes){
            shapes.each(function(s){
                Paint.shapeToDraw.shapes.push(Paint.factory(s));
            });
            Paint.shapeToDraw.draw();
        },function(){Paint.showMessage("Image not found")});
    },
    //to get last n saved images
    //if n>count, retrieves all images
    //add then in little canvas on the right
    //with name as a link to open image saved
    getRecent:function(n)
    {
        var oldctx=Paint.context;
        var oldshapes=Paint.shapeToDraw.shapes;
        $('recentcontent').update("");
       
        Database.getAllImages(function(i){
                var recentdiv=$('recentcontent').insert("<div style='border-bottom: 1px solid black;'>"+
                                                        "<a href='javascript:Paint.openImage(\""+i.name+"\")'>"+i.name+"</a>"+
                                                        "<br />");
                var c= document.createElement("canvas");
                c.setStyle({"border": "1px solid black"});
                c.width=75;
                c.height=75;
                recentdiv.insert(c);
                Paint.context= c.getContext('2d');
                //scale canvas to be able to see the image
                Paint.context.scale(0.1,0.1);
                Paint.shapeToDraw.shapes=[];
                i.shapes.each(function(s){
                Paint.shapeToDraw.shapes.push(Paint.factory(s));
                });
                Paint.shapeToDraw.draw();                
                recentdiv.insert("</div>");
                Paint.context=oldctx;
                Paint.shapeToDraw.shapes=oldshapes;
            });
        
        
    },
    
    //factoryMethod to create the appropriate shape according to shape.type
    //used when retrieving objects from database to recreate the appropriate CompositeShape
    factory:function(shape)
    {
        var ret;
        switch (shape.type)
        {
            case 'Rectangle':
                var p=new Point(shape.points[0].x,shape.points[0].y);
                var w=(shape.points[1].x-shape.points[0].x);
                var h=(shape.points[2].y-shape.points[0].y);
                ret= new Rectangle(p,w,h);
                break;
            case 'Circle':
                var p=new Point(shape.points[0].x,shape.points[0].y);
                ret= new Circle(p,shape.radius);
                break;
            default:
                ret=new Shape();
                shape.points.each(function(p){
                        ret.points.push(new Point(p.x,p.y));
                    });
        }
        ret.isFill=shape.isFill;
        ret.color=shape.color;
        ret.lineWidth=shape.lineWidth;
        return ret;
    },
    //To show alert or information to the UI
    showMessage:function(msg)
    {
        this.msg.update(msg).setOpacity(0);
        new Effect.Opacity(this.msg,{from:0.0,to:1.0,duration:1.0});
        setTimeout(function(){
            new Effect.Opacity(Paint.msg,{from:1.0,to:0.0,duration:1.0});
            },3000)
        
    }
};