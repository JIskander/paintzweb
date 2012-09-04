//Paint Main Classes

//Point Class represented by x, y coordinates
var Point=Class.create({
    initialize:function(x,y)
        {
            this.x=x;
            this.y=y;
        }
});


//Shape class, parent of all other classes, represents a freehand shape
var Shape=Class.create({
    initialize:function()
    {
        this.type='FreeHand';
        this.points=[];
        this.isFill=false;
        this.color='rgb(0,0,0)';
        this.lineWidth=1;
    },
    draw:function(){
        var ctx= Paint.context;
        ctx.lineWidth=this.getLineWidth();
        ctx.beginPath();
        ctx.moveTo(this.points[0].x,this.points[0].y);
        for(var i=1;i<this.points.length;i++){
            ctx.lineTo(this.points[i].x, this.points[i].y);              
        }
        if(this.isFill)
        {
             ctx.fillStyle=this.getColor();
             ctx.fill();
        }
        else
        {
            ctx.strokeStyle=this.getColor();
            ctx.stroke();
        }
    },
    fill:function(){
        var ctx= Paint.context;
        ctx.fillStyle=this.getColor();
        ctx.lineWidth=this.getLineWidth();
        ctx.beginPath();
        ctx.moveTo(this.points[0].x,this.points[0].y);
        for(var i=1;i<this.points.length;i++){
            ctx.lineTo(this.points[i].x, this.points[i].y);              
        }
        ctx.lineWidth=this.getLineWidth();
        ctx.fill();
    },
    getRandomColor:function(){
        var rgb=[];
        for(var i=0;i<3;i++){
            rgb[i]=Math.round(255*Math.random());
        }
        return 'rgb('+rgb.join(',')+')';
    },
    getColor:function(){
        
        return this.color;        
    },
    getLineWidth:function(){
        return this.lineWidth;
    },
    setColor:function(color){
        var rgb=[];
        for(var i=0;i<3;i++){
            rgb[i]=Math.round(255*color[i]);
        }
        this.color = 'rgb('+rgb.join(',')+')';        
    },
    setLineWidth:function(width){
        this.lineWidth= Paint.lineWidth;
    }
});


//N.B. All shapes must have one point more than needed,
//It is the 1st point added to the end of the point array
//this is done to close the shape

//Triangle Class
var Triangle=Class.create(Shape, {
    initialize:function(a,b,c)  
    {
        this.type="Triangle";
        this.points=[a,b,c,a];
    }
});


var Rectangle=Class.create(Shape,{
    initialize:function(p,side_a,side_b)
    {
        this.type="Rectangle";
        this.points=[p, new Point(p.x+side_a,p.y),new Point(p.x+side_a,p.y+side_b),new Point(p.x,p.y+side_b),p ];
    }
});

var Square=Class.create(Shape,{
    initialize:function(p,side)
    {
        this.type="Square";
        this.points=[p, new Point(p.x+side,p.y),new Point(p.x+side,p.y+side),new Point(p.x,p.y+side),p ];
        //Rectangle.call(this,p,side,side);
    }
});

var Circle=Class.create(Shape,{
    initialize:function(p,radius)
    {
        this.type="Circle";
        this.points=[p];
        this.radius=radius;
    },
    draw:function()
    {
        var context= Paint.context;
        context.beginPath();
        context.lineWidth=this.getLineWidth();
        context.arc(this.points[0].x, this.points[0].y, this.radius, 0, 2 * Math.PI, false);
        if(this.isFill)
        {
             context.fillStyle=this.getColor();
             context.fill();
        }
        else
        {
             context.strokeStyle = this.getColor();
            context.stroke();
        }
        
    },
    fill:function()
    {
        var context= Paint.context;
        context.beginPath();
        context.lineWidth=this.getLineWidth();
        context.fillStyle = this.getColor();
        context.arc(this.points[0].x, this.points[0].y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
    },
    setRadius:function(endPoint)
    {
       this.radius= (Math.sqrt(Math.pow(this.points[0].x-endPoint.x,2)+Math.pow(this.points[0].y-endPoint.y,2)));
    }
});


//Composite shape is a composite containing other shapes, to help save the image drawn,
//needed for draging shapes, undo, redo and saving.
var CompositeShape=Class.create(Shape,{
    initialize:function(shapes)
    {
        this.type="Composite";
        this.shapes=shapes;
    },
    draw:function(){
        for(var i=0;i<this.shapes.length;i++)
        {
            this.shapes[i].draw();
        }
    },
     fill:function(){
        for(var i=0;i<this.shapes.length;i++)
        {
            this.shapes[i].fill();
        }
    }
});
