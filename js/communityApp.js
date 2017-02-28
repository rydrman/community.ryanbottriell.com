function CommunityApp() {
    this.textPos = 0;
    this.textWidth = 0;
	
	//mouse
	this.mousePos = {x:0, y:0};
    this.mouseDown = false;
    
    this.mainTitle = "Community: Living Simply";
    this.title = {};
    this.title.old = "";
    this.title.transition = 1;
    this.title.text = "Community: Living Simply";
    this.title.pos = {x: 0.5, y:0.5};
    this.title.targetX = 0.5;
    this.title.targetSize = 100;
    this.title.size = 100;
    this.title.width = 0;
    
    //main jQuery items
    this.header = null;
    this.canvas = null;
    this.text = null;
    this.sections = null;
    
    //drawing context
    this.ctx = null;
	
    //scroll stuff
    this.scrollPos = 0;
    
    //time stuff
    this.lastUpdate = Date.now();
    this.updateTimeMS = 16;
    this.framerate = 30;
	
    //
    this.loaded = false;
    
    this.bottomImg = new Image();
    this.bottomImg.src = "../content/Bottom-Shadow.png";

};

CommunityApp.prototype.init = function(header, canvas, text)
{   
    //store jQuery onjs
    this.header = header;
    this.canvas = canvas;
    this.text = text;
    
    //event for canvas
    this.canvas.on('mouseup', function(e) {app.onMouseUp(e)} );
    this.header.on('mouseup', function(e) {app.onMouseUp(e)} );
    $("#profile-text").on('mouseup', function(e) {app.onMouseUp(e)} );
    this.canvas.on('mousedown', function(e) {app.onMouseDown(e)} );
    this.header.on('mousedown', function(e) {app.onMouseDown(e)} );
    $("#profile-text").on('mousedown', function(e) {app.onMouseDown(e)} );
    this.canvas.on('mousemove', function(e) {app.onMouseMove(e)} );
    this.header.on('mousemove', function(e) {app.onMouseMove(e)} );
    $("#profile-text").on('mousemove', function(e) {app.onMouseMove(e)} );
    
    //get drawing context
    this.ctx = this.canvas[0].getContext('2d');
	//make media manager
	this.media = new mediaManager( this.ctx );
    
    //scroll stuff setup
    this.header.open = true;
    this.canvas.open = true;
    
    //store section headers
    this.sections = $(".section-header");
    //store background images
    var sec;
    for(var i = 0; i < this.sections.length; ++i)
    {
        sec = this.sections[i];
        sec.img = document.getElementById(sec.id + "-background");
    }
    
    //collect images
    this.titleImg = $("#title-image")[0];
	this.icons = [ $("#icon-gallery")[0], $("#icon-map")[0], $("#icon-profiles")[0]  ];
	this.icons.position = {x: 0.4, y:0.6};
	this.icons.size = 1;
    //this.tractorImg = $("#tractor-image")[0];
    
    //collect videos
    this.opening = this.getVideo("#opening-video");
    
    //startup sequence
    this.onResize(0);
    this.title.text = "";
    this.transitionTitle(this.mainTitle);
    this.onResize(0);
    this.toggleCanvas(true, false);
    this.onScroll(-1);
    this.scrollText(0);
    
    this.loaded = true;
}

CommunityApp.prototype.update = function()
{
    var newTime = Date.now();
    this.updateTimeMS = newTime - this.lastUpdate;
    this.framerate = (this.framerate * 9 + (1000 / this.updateTimeMS)) * 0.1; 
    this.lastUpdate = newTime;
    
    if(!this.loaded) return;
    
    if(this.media.open) this.media.update();
}

CommunityApp.prototype.render = function()
{
    var w = this.ctx.canvas.width,
        h = this.ctx.canvas.height;
    
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, w, h);
    
    if(this.media.alpha > 0.0)
    {
        this.media.render();
    }
    if(this.media.alpha < 1.0)
    {
        this.ctx.save();
            this.ctx.globalAlpha = 1 - this.media.alpha;
            var dim = fillImg(this.titleImg, this.canvas[0].width, this.canvas.h); 
            this.ctx.drawImage(this.titleImg, 0, 0, dim.w, dim.h);
        this.ctx.restore();
    }
    
    //bottom image
    this.ctx.globalAlpha = 0.8;
    this.ctx.drawImage(this.bottomImg, 0, this.canvas.h - this.bottomImg.height, this.canvas[0].width, this.bottomImg.height);
    this.ctx.globalAlpha = 1.0;
    
    //draw current title
    this.ctx.font = ((this.title.size < this.title.targetSize) ? this.title.size : this.title.targetSize) + "px title-font";
    this.ctx.textAlign = "left"
    //old text
    this.ctx.fillStyle = "rgba(0, 0, 0, " + (1 - this.title.transition) + ")";
    this.ctx.fillText(this.title.old, this.canvas[0].width * this.title.pos.x + 2, this.canvas.h * this.title.pos.y + 2);
    //this.ctx.fillStyle = "rgba(255, 255, 255, " + (1 - this.title.transition) + ")";
    //this.ctx.fillText(this.title.old, this.canvas[0].width * this.title.pos.x, this.canvas.h * this.title.pos.y);
    //new text
	this.ctx.fillStyle = "rgba(0, 0, 0, " + this.title.transition + ")";;
    this.ctx.fillText(this.title.text, this.canvas[0].width * this.title.pos.x + 2, this.canvas.h * this.title.pos.y + 2);
	this.ctx.fillStyle = "rgba(255, 255, 255, " + this.title.transition + ")";;
    this.ctx.fillText(this.title.text, this.canvas[0].width * this.title.pos.x, this.canvas.h * this.title.pos.y);
    
    //icons
	for( var i=0; i < this.icons.length; i++)
	{
        if( isinBounds(this.mousePos,
                           ((this.icons.position.x + i * 0.1 ) * this.canvas[0].width) - 25,
                           (this.icons.position.y) * this.canvas.h,
                           ((this.icons.position.x + i * 0.1 ) * this.canvas[0].width) + 25,
                           ((this.icons.position.y) * this.canvas.h + 50 )))
        {
            this.ctx.fillStyle = "rgba(0,0,0,0.63)";
            this.ctx.beginPath();
            this.ctx.arc( ((this.icons.position.x + i * 0.1 ) * this.canvas[0].width),
                          (this.icons.position.y) * this.canvas.h + 25,
                          25, 0, Math.PI*2, false);
            this.ctx.fill();
        }
		this.ctx.drawImage(this.icons[i], ( (this.icons.position.x + i*0.1 )*w) - 25, this.icons.position.y *h, this.icons[i].width*this.icons.size, this.icons[i].height*this.icons.size);
	}
    
	
	
}

CommunityApp.prototype.onScroll = function(delta)
{
    var prevScroll = this.scrollPos;
    
    this.scrollPos += delta;
    if(this.scrollPos < 0) this.scrollPos = 0;

    //scroll down
    if(delta > 0)
    {
        if(this.header.open)
        {
            this.header.open = false;
            this.setSizes(0.2);
        }
        else if (this.canvas.open)
        {
            this.toggleCanvas(false);
        }
        else
        {
            //stop when at bottom
            if(this.scrollPos * 50 >= this.text[0].scrollHeight - this.text.h)
                this.scrollPos = Math.ceil((this.text[0].scrollHeight - this.text.h) / 50);
            //animate text block
            this.scrollText(0.5);
        }
    }
    //scroll up
    else if(delta < 0)
    {
        if(this.scrollPos == 0)
        {
            if(this.canvas.open)
            {
                this.header.open = true;
                this.setSizes(0.5);
            }
            else
            {
                this.toggleCanvas(true, false);
            }
            
        }

        this.scrollText(0.5);
    }
    
    return this.scrollPos;
}

CommunityApp.prototype.scrollText = function(time)
{
    //animate text block
    if(typeof(this.text.scrollTween) != 'undefined')
        this.text.scrollTween.kill();
    this.text.scrollTween = TweenLite.to(this.text[0], 0.5, {scrollTop:50*this.scrollPos, ease:Quad.easeOut, overwrite:2});
    
    //animate all background positions of headers
    var sec, pos, newPos, perc, backPos;
    for(var i = 0; i < this.sections.length; i++)
    {
        sec = this.sections[i];
        
        //calculate new position in div
        pos = $(sec).position();
        newPos = pos.top + this.text[0].scrollTop - 50*this.scrollPos;
        if(pos.top + sec.h > 0 && newPos + sec.h < 0)
        {
            this.transitionTitle(sec.id);
        }
        else if(pos.top < 0 && newPos > 0)
        {
            if(i==0)
                this.transitionTitle(this.mainTitle);
            else
                this.transitionTitle(this.sections[i-1].id);
        }
         
        perc = newPos / (this.text.h + sec.h);
        perc = Math.max(0, Math.min(1, perc));
        backPos = Math.round( perc * (sec.img.fillDimensions.h - sec.h ) );
        TweenLite.killTweensOf(sec);
        TweenLite.to(sec, time, {css:{backgroundPosition: "0px " + (-backPos) + "px"}, ease:Quad.easeOut, overwrite:2});
    }
}

//sections menu
function menuClick ( target )
{    
    app.canvas.open = false;
    app.header.open = false;
    app.setSizes(0.5);
    var position = $( target ).position().top / 50;
    app.scrollPos += position;
    app.scrollText(0.5);
    console.log(scrollTo);    
}

CommunityApp.prototype.transitionTitle = function(newTitle)
{
    //make string happy for title
    newTitle = humanize(newTitle);
    
    //tween new text in
    this.title.old = this.title.text;
    this.title.text = newTitle.substr(0, newTitle.length-1);
    this.title.transition = 0;
    TweenLite.to(this.title, 0.5, {transition:1});
}

CommunityApp.prototype.onMouseDown = function(e)
{
    this.mouseDown = true;
    this.mousePos = this.getMouseOnCanvas(e);
    if(this.media.open)
    {
        this.media.onMouseDown(this.mousePos.x, this.mousePos.y);
    }
}

CommunityApp.prototype.onMouseUp = function(e)
{
    //get mouse position 
    this.mousePos = this.getMouseOnCanvas(e);
    this.mouseDown = false;
       
    if( (this.canvas.open && this.mousePos.y < 0) 
       || (!this.canvas.open && this.mousePos.y < this.canvas.h - 100))
    {
        //click is for header
        if(!this.header.open)
        {
            this.header.open = true;
            this.setSizes(0.5);
        }
        else{
            //check for click on
            //sections
            //about
            if(e.target.id == "about-us")
            {
                var win = window.open("aboutus.html");
                win.focus();
            }
            else(e.target.id == "sections")
             {
                 var styleVal = $("#sections-menu").css("display");
                 
                 if(styleVal == "none")
                 {
                    $("#sections-menu").css("display", "block").fadeIn(1000);
                 }                 
                 else
                 {
                    $("#sections-menu").css("display", "none").fadeOut(1000);
                 }
             }
        }
    }
    else
    {

        for( i=0; i < this.icons.length; i++)
        {
            if( isinBounds(this.mousePos,
                           ((this.icons.position.x + i * 0.1 ) * this.canvas[0].width) - 25,
                           (this.icons.position.y) * this.canvas.h,
                           ((this.icons.position.x + i * 0.1 ) * this.canvas[0].width) + 25,
                           ((this.icons.position.y) * this.canvas.h + 50 )))
            {
                 //update media manager onclick
                this.toggleCanvas(true, true);
                this.media.openPage(i);
                this.media.mouseDown = false;
                return;
            }
        }
        
        if(this.media.open)
        {
            this.media.onMouseUp(this.mousePos.x, this.mousePos.y);
        }
        else
        {
            this.toggleCanvas(true, false);
            this.media.mouseDown = false;
        }
    }

}

CommunityApp.prototype.onMouseMove = function(e)
{
    this.mousePos = this.getMouseOnCanvas(e);
    if(this.media.open)
    {
        this.media.onMouseMove(this.mousePos.x, this.mousePos.y);
    }
}

CommunityApp.prototype.getMouseOnCanvas = function (e) 
{
   //mouse position
	var posX = e.clientX;
	var posY = e.clientY;
	//relative to canvas
	var can = this.canvas[0].getBoundingClientRect();
	
	var x = posX - can.left;
	var y = posY - can.top;
	
	return { x: x, y: y }; 
}

CommunityApp.prototype.setSizes = function(time)
{
    //gather and store div heights
    var windowHeight = parseInt($("body").css("height"));
    
    this.header.h = 150;
    this.header.t = (this.header.open) ? 0 : -50;
    this.header.end = (this.header.open) ? 84 : 34;
    
    this.canvas.h = 0.8 * windowHeight;
    if(this.canvas.open)
        this.canvas.t = -this.header.h + this.header.end;
    else
        this.canvas.t = -this.header.h + this.header.end - this.canvas.h + 100;
    this.canvas.end = this.header.h + this.canvas.h + this.canvas.t;
    
    this.text.h = windowHeight - this.canvas.end;
    this.text.t = -(this.header.h + this.canvas.h) + this.canvas.end;
    this.text.end = windowHeight;
    
    TweenLite.killTweensOf(this.header[0]);
    TweenLite.killTweensOf(this.canvas[0]);
    TweenLite.killTweensOf(this.text[0]);
    
    TweenLite.to(this.header[0], time, {css:{top:this.header.t + "px"}, ease:Quad.easeOut});
    TweenLite.to(this.canvas[0], time, {css:{top:this.canvas.t + "px"}, ease:Quad.easeOut});
    TweenLite.to(this.text[0], time, {css:{top:this.text.t + "px", height:this.text.h + "px"}, ease:Quad.easeOut});
}

CommunityApp.prototype.onResize = function(time)
{
    //calc new sizes
    this.setSizes(0);
    
    //set item heights
    this.ctx.canvas.width = parseInt(this.canvas.css("width"));
    this.ctx.canvas.height = this.canvas.h;
    this.canvas.css("height", this.canvas.h + "px");
    
    this.media.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
    
    //adjust section header sizes
    var sec, dim;
    if(this.sections != null)
    {
        for(var i = 0; i < this.sections.length; i++)
        {
            sec = this.sections[i];
            sec.h = parseInt($(sec).css("height")) + parseInt($(sec).css("padding-top"));
            dim = fillImg(sec.img, parseInt($(sec).css("width"))+5, parseInt($(sec).css("height")));
            sec.img.fillDimensions = dim;
            this.sections.css("background-size", dim.w + "px " + dim.h + "px")
        }
    }
    
    //calculate title widthand set font size
    var w, size = this.title.targetSize;
    do
    {
        this.ctx.font = size + "px title-font";
        this.title.width = this.ctx.measureText(this.title.text).width;
        --size;
    }
    while(this.title.width > this.canvas[0].width)
    
    this.title.size = size;
    this.title.targetX = (this.canvas[0].width * 0.5 - this.title.width*0.5) / this.canvas[0].width;
    if(this.canvas.open && !this.media.open)
        this.title.pos.x = this.title.targetX;
}

CommunityApp.prototype.toggleCanvas = function( open, openUI )
{
    if(typeof(open) == 'undefined')
    {
        open = !this.canvas.open;
    }
    
    if(open == true)
    {
        if(openUI)
        {
            //animate text
            TweenLite.to( this.title.pos, 0.5, {x: 5 / this.canvas[0].width, y: 1 - (15 / this.canvas.h), ease:Quad.easOut});
            TweenLite.to( this.title, 0.5, {targetSize: 60, ease:Quad.easeOut});
			
			//animate icons
			for( var i=0; i < this.icons.length; i++)
			{
				TweenLite.to(this.icons.position, 0.5, {x: 0.76, y:1 - (60 / this.canvas.h), ease:Quad.easeOut } );
				TweenLite.to(this.icons, 0.5, {size: 0.5, ease:Quad.easeOut } );
			}
            
            //signal media to open menu
            this.media.open = true;
            TweenLite.to(this.media, 0.5, {alpha:1});
        }
        else
        {
            //animate text
            this.title.targetSize = 100;
            this.onResize(0.5);
            var size = this.title.size;
            this.title.targetSize = 60;
            TweenLite.to( this.title.pos, 0.5, {x:this.title.targetX ,y: 0.5, ease:Quad.easeOut});
            TweenLite.to( this.title, 0.5, {size:size, targetSize: 100, ease:Quad.easeOut});
            this.onResize(0.5);
            
			//animate icons
			for( var i=0; i < this.icons.length; i++)
			{
				TweenLite.to(this.icons.position, 0.5, {x: 0.4, y:0.6, ease:Quad.easOut});
				TweenLite.to(this.icons, 0.5, {size: 1, ease:Quad.easeOut } );
			}

        }
        //mark as open
        this.canvas.open = true;
        
    }
    else if(open == false)
    {
        //animate text
        TweenLite.to( this.title.pos, 0.5, {x:5 / this.canvas[0].width, y: 1 - (15 / this.canvas.h), ease:Quad.easeOut});
        TweenLite.to( this.title, 0.5, {targetSize: 60, ease:Quad.easeOut});
        
        $("#profile-text").hide();
		
		//animate icons
		for( var i=0; i < this.icons.length; i++)
		{
			TweenLite.to(this.icons.position, 0.5, {x: 0.76, y:1 - (60 / this.canvas.h), ease:Quad.easOut});
			TweenLite.to(this.icons, 0.5, {size: 0.5, ease:Quad.easeOut } );
		}
        
        //signal media to close ui
        
        //mark as closed
        this.canvas.open = false;
        this.media.open = false;
        TweenLite.to(this.media, 0.5, {alpha:0});
    }
    this.setSizes(0.5);
}

CommunityApp.prototype.getVideo = function(selector)
{
    var vid = $(selector)[0];
    //vid.play();
    return vid;
}

function fillImg(img, w, h)
{
    var fitW = w / img.width;
    var fitH = h / img.height;
    var imgW = (fitW > fitH) ? w : img.width * fitH;
    var imgH = (fitH > fitW) ? h : img.height * fitW;
    
    return {w: imgW, h: imgH};
}

function humanize(s)
{
    var words = s.split("-");
    s = "";
    for(var i in words)
    {
        s += words[i].substr(0, 1).toUpperCase() + words[i].substr(1) + " ";
    }
    return s;
}