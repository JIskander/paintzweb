//UI initialization and events wireup

//on window load 
Event.observe(window,'load',function(e){

            //Initialize Paint
            Paint.init();
            //set toggle buttons
            $$(".toggle").each(function(e){
                                        e.observe('click',function(evt){
                                                                var elem=Event.element(evt);
                                                                elem.toggleClassName('down');
                                                                if(elem.hasClassName('lefthr'))
                                                                {
                                                                    Paint.setLineWidth(parseInt(elem.firstChild.id.substring(1)));
                                                                }
                                                                else if(elem.hasClassName('leftimgs'))
                                                                {
                                                                    Paint.setShape(elem.alt);
                                                                    if(elem.alt=="Erase")
                                                                    {
                                                                        if(Paint.color!=[1,1,1])
                                                                        {
                                                                           Paint.color=[1,1,1];
                                                                           colorPicker.fromString('FFFFFF');
                                                                        }
                                                                        
                                                                    }
                                                                } 
                                                                $$(".toggle").each(function(e){
                                                                        if(e!=elem  && elem.tagName==e.tagName)
                                                                        {
                                                                            e.removeClassName('down');
                                                                        }
                                                                    });
                                                                })
                                        });
            //Color Picker
            var colorPicker = new jscolor.color($('color'), {})
            colorPicker.fromString('000000');
            colorPicker.onImmediateChange = function(){Paint.setColor(this.rgb);}
            
            //Mouse events on canvas
            Paint.canvas.observe('mousedown',Paint.mousedown);
            Paint.canvas.observe('mousemove',Paint.mousemove);
            Paint.canvas.observe('mouseup',Paint.mouseup);
            
            //Toolbar events
            $('newBtn').observe('click',Paint.clearCanvas);
            $('saveBtn').observe('click',function(e){
                            var name=prompt("Enter filename","Untitled");
                            if(name)
                            {
                              Paint.saveCanvas(name)
                              Paint.getRecent(10);
                            }
                            });
            $('openBtn').observe('click',function(e){
                            var name=prompt("Enter filename","");
                            if (name)
                               Paint.openImage(name);
                            });
            $('downloadBtn').observe('click',Paint.downloadCanvas);
            $('undoBtn').observe('click',Paint.undo);
            $('redoBtn').observe('click',Paint.redo);
            $('recentBtn').observe('click',function(e){
                            Paint.getRecent(10);
                            });
});