function mediaManager ( ctx )
{
	
	//passing the context
	this.ctx = ctx;
	this.mouse = {x:0, y:0};
    this.mouseDown = false;
    
    //app state
    this.open = false;
    this.alpha = 0;
    
    //for storing dimentions
    this.canvas = {w:ctx.canvas.width, h:ctx.canvas.height};
    
    //media
    this.images = [];
    
    //pages
    //0 = gallery, 1 = map, 2 = profiles
    this.currentPage = 0;
    //used when item is open
    this.currentItem = null;
    //gallery
    this.gallery = {};
    this.gallery.w = 1;
    this.gallery.h = 1;
    this.gallery.pages = 1;
    this.gallery.currentPage = 0;
    this.gallery.nav = {};
    
    //map
    this.map = {};
    this.map.img = $("#map-image")[0];
    this.map.bounds = {t: 0, l:0, r:0, b:0};
    this.map.pos = {x:0, y:0};
    this.map.locations = {};
    this.map.gallery = {};
    this.map.gallery.current = null;
    this.map.gallery.nav = {};
    this.map.gallery.currentPage = 0; 
    
    //profiles
    this.profiles = {};
    this.profiles.data = [];
    this.profiles.vidPlayImg = $("#video-play")[0];    
    this.profiles.isText = false;
    
    //get image and icon list
    //$.get("../php/getDataList.php", this.loadData);
    $.getJSON("../php/getDataList.php", this.loadData);
    
}

mediaManager.prototype.loadData = function( data )
{
    //load images and track their progress
    var loc;
    for(i in data.images)
    {
        var img = {};
        img.id = data.images[i].id;
        img.thumb = new Image();
        img.thumbSrc = data.images[i].thumb;
        img.img = new Image();
        img.imgSrc = data.images[i].file;
        img.tags = data.images[i].tags;
        loc = data.images[i].location;
        if(loc != "")
        {
            if(typeof(app.media.map.locations[loc]) == 'undefined')
            {
                app.media.map.locations[loc] = {}
                app.media.map.locations[loc].name = humanize(data.images[i].location);
                app.media.map.locations[loc].mapX = parseFloat(data.images[i].mapX);
                app.media.map.locations[loc].mapY = parseFloat(data.images[i].mapY);
                app.media.map.locations[loc].images = [];
            }
            app.media.map.locations[loc].images.push(img);
        }
        app.media.images.push(img);
    }
    
    for(i in data.profiles)
    {
        var profile = {};
        profile.id = data.profiles[i].id;
        profile.name = data.profiles[i].name;
        profile.imgColor = new Image();
        profile.imgColor.src = data.profiles[i].icon2;
        profile.imgBW = new Image();
        profile.imgBW.src = data.profiles[i].icon1;
        profile.imgFull = new Image();
        profile.imgFull.src = data.profiles[i].iconFull;
        profile.video = document.createElement('video');
        profile.video.src = data.profiles[i].video;
        profile.video.autoPlay = false;
        profile.video.preload = 'none';
        profile.iconFade = 0;
        var index = app.media.profiles.data.length;
        //request text
        $.getJSON("content/profiles/" + profile.name + ".json", function(data){
            app.media.profiles.data[data.index].text = data.text;
        });
        app.media.profiles.data.push(profile);
    }
    
    app.media.onResize(app.canvas[0].width, app.canvas.h);
}

mediaManager.prototype.update = function()
{
    if(!this.open)
        return;
    
    switch(this.currentPage)
    {
        case 2:
            //profile icon fade
            var size = this.profiles.menuSize;
            for(var i = 0; i < this.profiles.data.length; ++i)
            {
                if(isinBounds(this.mouse,
                      (this.profiles.menuCenter.x - size * 315) + i%3 * 210 * size,
                      (this.profiles.menuCenter.y - size * 210) + Math.floor(i/3) * 210 * size,
                      (this.profiles.menuCenter.x - size * 315) + (i%3 * 210 * size + 200 * size),
                      (this.profiles.menuCenter.y - size * 210) + (Math.floor(i/3) * 210 * size + 200 * size)))
                {
                    this.profiles.data[i].iconFade = (this.profiles.data[i].iconFade > 1) ? 1 : this.profiles.data[i].iconFade + 0.05;
                }
                else
                {
                    this.profiles.data[i].iconFade = (this.profiles.data[i].iconFade < 0) ? 0 : this.profiles.data[i].iconFade - 0.05;
                }
            }
            break;
        default:
            break;
    }
} 

mediaManager.prototype.render = function()
{
    this.ctx.save();
	switch(this.currentPage)
    {
        /////////////////////////////////////////////////
        case 0: //gallery
            this.drawGallery(this.images, this.gallery);
            break; 
        
        ////////////////////////////////////////////////////
        case 1: //map
            this.ctx.save();
            this.ctx.translate(this.map.pos.x, this.map.pos.y);
            this.ctx.drawImage(this.map.img, 0, 0);
            
            //draw image positions
            this.ctx.font = "20px main-font"
            this.ctx.textAlign  ="left";
            this.ctx.strokeStyle = "#FFF";
            this.ctx.lineWidth = 2;
            for(name in this.map.locations)
            {
                if(this.map.locations[name].hover)
                {
                    this.ctx.beginPath();
                    this.ctx.arc(this.map.locations[name].mapX,
                                 this.map.locations[name].mapY,
                                 11, 0, Math.PI*2, false);
                    this.ctx.stroke();
                    this.ctx.fillStyle = "#FFF";
                    this.ctx.fillText(this.map.locations[name].name,
                                      this.map.locations[name].mapX + 20,
                                      this.map.locations[name].mapY + 6);
                }
                else
                {
                    this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    this.ctx.beginPath();
                    this.ctx.arc(this.map.locations[name].mapX,
                                 this.map.locations[name].mapY,
                                 10, 0, Math.PI*2, false);
                    this.ctx.fill();
                }
                    
            }
            this.ctx.restore();
            if(this.map.gallery.current != null)
            {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                this.ctx.fillRect(0, 0, this.canvas.w, this.canvas.h);
                if(this.currentItem == null)
                {
                    this.ctx.fillStyle = "#222";
                    this.ctx.fillRect(0.5 * (this.canvas.w - 120 * this.map.gallery.w) - 25,
                                      -50 + 0.5 * (this.canvas.h - 120 * this.map.gallery.h) - 25,
                                      120 * this.map.gallery.w + 50, 120 * this.map.gallery.h + 50);
                }
                this.drawGallery(this.map.locations[this.map.gallery.current].images, this.map.gallery)
            }
            break;
        
        ///////////////////////////////////////////////////
        case 2: //profiles
            var x, y;
            for(var i = 0; i < this.profiles.data.length; ++i )
            {
                this.ctx.save();
                x = (this.profiles.menuCenter.x - this.profiles.menuSize * 315) + i%3 * 210 * this.profiles.menuSize;
                y = (this.profiles.menuCenter.y - this.profiles.menuSize * 210) + Math.floor(i/3) * 210 * this.profiles.menuSize;
                
                //b&w image
                this.ctx.drawImage(this.profiles.data[i].imgBW, x, y,
                                   200 * this.profiles.menuSize, 200 * this.profiles.menuSize);
                //color image
                if(this.profiles.data[i].iconFade > 0 || this.currentItem == i)
                {
                    this.ctx.globalAlpha = this.profiles.data[i].iconFade;
                    this.ctx.drawImage(this.profiles.data[i].imgColor, x, y,
                                       200 * this.profiles.menuSize, 200 * this.profiles.menuSize);
                }
                this.ctx.restore(); 
            }
            if(this.currentItem != null)
            {
                this.ctx.globalAlpha = this.profiles.picAlpha;
                this.ctx.drawImage(this.profiles.data[this.currentItem].imgFull,
                                   this.profiles.picPos.x, this.profiles.picPos.y,
                                   this.profiles.picSize, this.profiles.picSize);
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = "40px main-font";
                this.ctx.textAlign = "center";
                this.ctx.fillText(this.profiles.data[this.currentItem].name,
                                  this.canvas.w * 0.2, 
                                  this.profiles.targetPicPos.y + this.profiles.targetPicSize + 45);
                if(!this.profiles.isText)
                {
                    var mult = Math.min(
                        this.canvas.w * 0.5 / this.profiles.data[this.currentItem].video.videoWidth,
                        this.canvas.h * 0.8 / this.profiles.data[this.currentItem].video.videoHeight);
                    this.ctx.drawImage(this.profiles.data[this.currentItem].video,
                                       this.canvas.w * 0.4, 
                                       this.canvas.h * 0.5 - this.profiles.data[this.currentItem].video.videoHeight * mult * 0.5,
                                       this.profiles.data[this.currentItem].video.videoWidth * mult, 
                                       this.profiles.data[this.currentItem].video.videoHeight * mult);
                    if(this.profiles.data[this.currentItem].video.paused)
                    {
                        this.ctx.drawImage(this.profiles.vidPlayImg,
                                           this.canvas.w * 0.4 + this.profiles.data[this.currentItem].video.videoWidth * mult * 0.5 - 100,
                                           this.canvas.h * 0.5 - 100);
                    }
                    else if(this.profiles.data[this.currentItem].video.readyState < 4)
                    {
                        //draw loading circle
                        drawLoader(this.ctx, this.canvas.w * 0.4 + this.profiles.data[this.currentItem].video.videoWidth * mult * 0.5 - 50,
                                   this.canvas.h * 0.5 - 50, 
                                   100, 100);
                    }
                    this.ctx.fillStyle = "#444";
                    this.ctx.font = "30px main-font";
                    this.ctx.textAlign = "left";
                    this.profiles.textWidth = this.ctx.measureText("switch to text").width;
                    this.ctx.fillRect(this.canvas.w * 0.41 - 10, this.canvas.h * 0.15 - 30, this.profiles.textWidth + 20, 40);
                    this.ctx.fillStyle = "#FFF";
                    this.ctx.fillText("switch to text", this.canvas.w * 0.41, this.canvas.h * 0.15);
                }
                else
                {
                    this.ctx.fillStyle = "#444";
                    this.ctx.font = "30px main-font";
                    this.ctx.textAlign = 'left';
                    this.profiles.textWidth = this.ctx.measureText("switch to video").width;
                    this.ctx.fillRect(this.canvas.w * 0.41 - 10, this.canvas.h * 0.15 - 30, this.profiles.textWidth + 20, 40);
                    this.ctx.fillStyle = "#FFF";
                    this.ctx.fillText("switch to video", this.canvas.w * 0.41, this.canvas.h * 0.15);
                }
            }
            break;
            
        default:
            break;
    }
    this.ctx.restore();
    
    //draw mouse
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 10, 0, Math.PI*2, false);
    this.ctx.fill();
} 

mediaManager.prototype.drawGallery = function(images, owner)
{
    if(this.currentItem != null)
    {
        for(var i = 0; i < images.length; ++i)
        {
            if(images[i].id == this.currentItem)
            {
                if(images[i].img.src == "")
                {
                    images[i].img.src = images[i].imgSrc;
                }
                if(images[i].img.complete)
                {
                    var dim = fillImg(images[i].img, app.canvas[0].width * 0.75, app.canvas.h * 0.75);
                    this.ctx.drawImage(images[i].img, 
                                     app.canvas[0].width * 0.5 - dim.w * 0.5, 
                                     app.canvas.h * 0.5 - dim.h * 0.5,
                                     dim.w, dim.h);
                }
                else
                {
                    drawLoader(this.ctx, this.canvas.w * 0.5 - 50, this.canvas.h * 0.5 - 50, 100, 100);
                }
            }
        }
    }
    else
    {
        //draw gallery
        this.ctx.globalAlpha = this.alpha;
        var xBase = 0.5 * (this.canvas.w - 120 * owner.w),
            yBase = -50 + 0.5 * (this.canvas.h - 120 * owner.h),
            index,
            img;
        for(var i = 0; i < owner.imagesPerPage; i++)
        {
            index = i + owner.imagesPerPage * owner.currentPage;
            if( index >= images.length )
                break;
            img = images[index];
            if(img.thumb.complete && (img.thumb.naturalWidth != 0 && img.thumb.naturalWidth != 'undefined'))
            {
                this.ctx.drawImage(img.thumb, 
                               xBase + (i%owner.w)*120, 
                               yBase + 120 * Math.floor(i/owner.w));
            }
            else
            {
                if(img.thumb.src == '')
                    img.thumb.src = img.thumbSrc;
                this.ctx.fillStyle = "#333";
                this.ctx.fillRect(xBase + (i%owner.w)*120,
                                  yBase + 120 * Math.floor(i/owner.w),
                                  100, 100);
                drawLoader(this.ctx, xBase + 25 + (i%owner.w)*120,
                                  yBase + 25 + 120 * Math.floor(i/owner.w),
                                  50, 50);
            }


        }
        //draw pages at the bottom
        if(owner.pages > 1){
            var x = 0;
            this.ctx.save();
                this.ctx.translate(owner.nav.start, owner.nav.y);
                //left tringle
                this.ctx.fillStyle = "#666";
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(15, -12);
                this.ctx.lineTo(15, 12);
                this.ctx.closePath();
                this.ctx.fill();
                //circles
                x = 25;
                for(var i = 0; i < owner.pages; ++i)
                {
                    this.ctx.fillStyle = "#666";
                    if(i == owner.currentPage)
                        this.ctx.fillStyle = "#FFF";
                    this.ctx.beginPath();
                    this.ctx.arc(x+12.5, 0, 5, 0, Math.PI*2, false);
                    this.ctx.fill();
                    x += 25;
                }

                //right triangle
                x = owner.nav.w;
                this.ctx.fillStyle = "#666";
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x - 15, -12);
                this.ctx.lineTo(x - 15, 12);
                this.ctx.closePath();
                this.ctx.fill();
            this.ctx.restore();
        }
    }
}

mediaManager.prototype.openPage = function(section, mediaId)
{
    $("#profile-text").hide();
    
    if(typeof(section) != 'undefined')
        this.currentPage = section;
    else 
        return;
    
    switch(section)
    {
            
        //////////////////////////////////////////////////
        case 2: //profiles match name
            if(typeof(mediaId) != 'undefined')
            {
                switch(mediaId)
                {
                    case "kate":
                        this.currentItem = 0;
                        break;
                    case "christoff":
                        this.currentItem = 1;
                        break;
                    case "dulli":
                        this.currentItem = 2;
                        break;
                    case "patreesha":
                        this.currentItem = 3;
                        break;
                    case "rob":
                        this.currentItem = 4;
                        break;
                    case "steve":
                        this.currentItem = 5;
                        break;
                }
                this.profiles.data[this.currentItem].video.preload = 'auto';
            }
            else
            {
                this.currentItem = null;
            }
            app.toggleCanvas(true, true);
            this.onResize(this.canvas.w, this.canvas.h);
            break;
        
        case 1: //map takes default
            this.map.pos.x = this.canvas.w * 0.5 - this.map.img.width * 0.5;
            this.map.pos.y = this.canvas.h * 0.5 - this.map.img.height * 0.5;
        case 0: //gallery take deafult
        default:
            
            if(typeof(mediaId) != 'undefined')
            {
                this.currentItem = mediaId;
                app.toggleCanvas(true, true);
            }
            else
                this.currentItem = null;
            break;
    }

    this.open = true;
}

mediaManager.prototype.onMouseDown = function(x, y)
{
    this.mouseDown = true;
    this.lastMousePos = {x:x, y:y};
}

mediaManager.prototype.onMouseUp = function(x, y)
{
    this.mouse = {x:x, y:y};
    
    this.mouseDown = false;
    
    if(!this.open) return;
    
    switch(this.currentPage)
    {
        ///////////////////////////////////////
        case 0: //gallery
            if(this.currentItem == null)
            {
                //check for page switch
                if( isinBounds(this.mouse, 
                               this.gallery.nav.start,
                               this.gallery.nav.y - 12,
                               this.gallery.nav.start + 25,
                               this.gallery.nav.y + 12))
                {
                    //page back
                    if(this.gallery.currentPage > 0)
                       this.gallery.currentPage--;
                }
                else if( isinBounds(this.mouse, 
                                    this.gallery.nav.start + this.gallery.nav.w - 25,
                                    this.gallery.nav.y - 12,
                                    this.gallery.nav.start + this.gallery.nav.w,
                                    this.gallery.nav.y + 12))
                {
                    //page forward
                    if(this.gallery.currentPage < this.gallery.pages-1)
                        this.gallery.currentPage++;
                }
                //check image click

                var xBase = 0.5 * (this.canvas.w - 120 * this.gallery.w),
                    yBase = -50 + 0.5 * (this.canvas.h - 120 * this.gallery.h),
                    index,
                    img;
                for(var i = 0; i < this.gallery.imagesPerPage; i++)
                {
                    if(isinBounds(this.mouse, 
                                  xBase + (i%this.gallery.w)*120,
                                  yBase + 120 * Math.floor(i/this.gallery.w),
                                  xBase + (i%this.gallery.w)*120 + 100,
                                  yBase + 120 * Math.floor(i/this.gallery.w) + 100))
                    {
                        index = i + this.gallery.imagesPerPage * this.gallery.currentPage;
                        if( index >= this.images.length )
                            break;
                        this.currentItem = this.images[index].id;
                        //load image if necessary
                        if(this.images[index].img.src == "")
                            this.images[index].img.src = this.images[index].imgSrc;
                    }
                }
            }
            else
            {
                this.currentItem = null;
            }
            break;
            
        ///////////////////////////////////////////////
        case 1: //map
            if(this.map.gallery.current == null)
            {
                for(var name in this.map.locations)
                {
                    if(this.map.locations[name].hover)
                    {
                        this.map.gallery.current = name;
                        this.onResize(this.canvas.w, this.canvas.h);
                        break;
                    }
                }
            }
            else
            {
                var baseX = 0.5 * (this.canvas.w - 120 * this.map.gallery.w) - 25,
                    baseY = -50 + 0.5 * (this.canvas.h - 120 * this.map.gallery.h) - 25;
                if(this.currentItem != null)
                {
                    this.currentItem = null;
                }
                else if(!isinBounds(this.mouse,
                                    baseX, baseY,
                                    baseX + 120 * this.map.gallery.w + 50, 
                                    baseY + 120 * this.map.gallery.h + 50))
                {
                    this.map.gallery.current = null;
                    this.map.gallery.currentPage = 0;
                }
                else
                {
                    //check for image click
                    if( isinBounds(this.mouse, 
                               this.map.gallery.nav.start,
                               this.map.gallery.nav.y - 12,
                               this.map.gallery.nav.start + 25,
                               this.map.gallery.nav.y + 12))
                    {
                        //page back
                        if(this.map.gallery.currentPage > 0)
                           this.map.gallery.currentPage--;
                    }
                    else if( isinBounds(this.mouse, 
                                        this.map.gallery.nav.start + this.map.gallery.nav.w - 25,
                                        this.map.gallery.nav.y - 12,
                                        this.map.gallery.nav.start + this.map.gallery.nav.w,
                                        this.map.gallery.nav.y + 12))
                    {
                        //page forward
                        if(this.map.gallery.currentPage < this.map.gallery.pages-1)
                            this.map.gallery.currentPage++;
                    }
                    //check image click

                    var xBase = 0.5 * (this.canvas.w - 120 * this.map.gallery.w),
                        yBase = -50 + 0.5 * (this.canvas.h - 120 * this.map.gallery.h),
                        index,
                        img;
                    for(var i = 0; i < this.map.gallery.imagesPerPage; i++)
                    {
                        if(isinBounds(this.mouse, 
                                      xBase + (i%this.map.gallery.w)*120,
                                      yBase + 120 * Math.floor(i/this.map.gallery.w),
                                      xBase + (i%this.map.gallery.w)*120 + 100,
                                      yBase + 120 * Math.floor(i/this.map.gallery.w) + 100))
                        {
                            index = i + this.map.gallery.imagesPerPage * this.map.gallery.currentPage;
                            var images = this.map.locations[this.map.gallery.current].images;
                            if( index >= images.length )
                                break;
                            this.currentItem = images[index].id;
                            //load image if necessary
                            if(images[index].img.src == "")
                                images[index].img.src = images[index].imgSrc;
                        }
                    }
                }
            }
            break;
            
        ///////////////////////////////////////////////
        case 2: //profiles
            //open profile
            var size = this.profiles.menuSize;
            //check other profile buttons
            for(var i = 0; i < this.profiles.data.length; ++i)
            {
                if(isinBounds(this.mouse,
                              (this.profiles.menuCenter.x - size * 315) + i%3 * 210 * size,
                              (this.profiles.menuCenter.y - size * 210) + Math.floor(i/3) * 210 * size,
                              (this.profiles.menuCenter.x - size * 315) + (i%3 * 210 * size + 200 * size),
                              (this.profiles.menuCenter.y - size * 210) + (Math.floor(i/3) * 210 * size + 200 * size)))
                {
                    if(this.currentItem != null)
                        this.profiles.data[this.currentItem].video.pause();
                    this.currentItem = i;
                    this.profiles.picPos = {x: (this.profiles.menuCenter.x - this.profiles.menuSize * 315) + i%3 * 210 * this.profiles.menuSize, 
                                            y: (this.profiles.menuCenter.y - this.profiles.menuSize * 210) + Math.floor(i/3) * 210 * this.profiles.menuSize};
                    this.profiles.picSize = 200 * size;
                    this.profiles.picAlpha = 0;
                    TweenLite.to(this.profiles, 0.5, {picSize: this.profiles.targetPicSize, 
                                                      picAlpha:1,
                                                      menuSize: 0.25});
                    TweenLite.to(this.profiles.picPos, 0.5, {x: this.profiles.targetPicPos.x, y:this.profiles.targetPicPos.y});
                    TweenLite.to(this.profiles.menuCenter, 0.5, {x: this.canvas.w * 0.2, y:this.canvas.h * 0.75});
                    this.profiles.data[this.currentItem].video.preload = 'auto';
                    //hide text div
                    this.profiles.isText = false;
                    $("#profile-text").hide();
                    return;
                }
                
            }
            //check video click
            if(this.currentItem != null)
            {
                //text, video switch
                if(isinBounds(this.mouse,
                              this.canvas.w * 0.41 - 10, 
                              this.canvas.h * 0.15 - 30,
                              this.canvas.w * 0.41 + this.profiles.textWidth + 10, 
                              this.canvas.h * 0.15 + 10))
                {
                    if(!this.profiles.isText)
                    {
                        this.profiles.isText = true;
                        $("#profile-text").html(this.profiles.data[this.currentItem].text);
                        $("#profile-text").show();
                    }
                    else
                    {
                        this.profiles.isText = false;
                        $("#profile-text").hide();
                    }
                    return;
                }
                //video click
                if(!this.profiles.isText)
                {
                    var mult = Math.min(
                        this.canvas.w * 0.5 / this.profiles.data[this.currentItem].video.videoWidth,
                        this.canvas.h * 0.8 / this.profiles.data[this.currentItem].video.videoHeight);
                    if(isinBounds(this.mouse,
                                  this.canvas.w * 0.4, 
                                  this.canvas.h * 0.5 - this.profiles.data[this.currentItem].video.videoHeight * mult * 0.5,
                                  this.canvas.w * 0.4 + this.profiles.data[this.currentItem].video.videoWidth * mult, 
                                  this.canvas.h * 0.5 + this.profiles.data[this.currentItem].video.videoHeight * mult * 0.5))
                    {
                        if(this.profiles.data[this.currentItem].video.paused)
                            this.profiles.data[this.currentItem].video.play();
                        else
                            this.profiles.data[this.currentItem].video.pause();
                    }
                }

            }

            break;
        
        default:
            break;
    }
}

mediaManager.prototype.onMouseMove = function(x, y)
{
    this.lastMousePos = {x:this.mouse.x, y:this.mouse.y};
    this.mouse = {x:x, y:y};
    
    //map
    if(this.currentPage == 1 && this.map.gallery.current == null)
    {
        var dist,
            activeDist = Math.pow(20, 2);
        for(name in this.map.locations)
        {
            dist = Math.pow(this.mouse.x - this.map.pos.x - this.map.locations[name].mapX, 2) + Math.pow(this.mouse.y - this.map.pos.y - this.map.locations[name].mapY, 2);
            
            this.map.locations[name].hover = dist < activeDist;
        }
        //drag map
        if(this.mouseDown)
        {
            this.map.pos.x += this.mouse.x - this.lastMousePos.x;
            this.map.pos.y += this.mouse.y - this.lastMousePos.y;

            if(this.map.pos.x > this.map.bounds.r) this.map.pos.x = this.map.bounds.r;
            if(this.map.pos.x < this.map.bounds.l) this.map.pos.x = this.map.bounds.l;
            if(this.map.pos.y > this.map.bounds.b) this.map.pos.y = this.map.bounds.b;
            if(this.map.pos.y < this.map.bounds.t) this.map.pos.y = this.map.bounds.t;
        }
    }
}

mediaManager.prototype.onResize = function(w, h)
{
    //store canvas size
    this.canvas.w = w;
    this.canvas.h = h;
    
    //calculate gallery size
    this.gallery.w = Math.floor( w*0.75 / 120);
    this.gallery.h = Math.floor( h*0.75 / 120);
    this.gallery.imagesPerPage = this.gallery.h * this.gallery.w;
    this.gallery.pages = Math.ceil(this.images.length / this.gallery.imagesPerPage);
    this.gallery.nav.w = 25*this.gallery.pages + 50; //extra 50 for 2 arrows
    this.gallery.nav.start = (w - this.gallery.nav.w) * 0.5;
    this.gallery.nav.y =  h - 0.5 * (h - this.gallery.h * 120);
    
    //calculate map bounds
    this.map.bounds.r = w * 0.5;
    this.map.bounds.b = h * 0.5;
    this.map.bounds.l = w * 0.5 - this.map.img.width;
    this.map.bounds.t = h * 0.5 - this.map.img.height;
    //calculate gallery size for map
    if(this.map.gallery.current != null)
    {
        this.map.gallery.w = Math.floor( w*0.75 / 120);
        this.map.gallery.h = Math.floor( h*0.75 / 120);
        this.map.gallery.imagesPerPage = this.map.gallery.h * this.map.gallery.w;
        this.map.gallery.pages = Math.ceil(this.map.locations[this.map.gallery.current].images.length / this.map.gallery.imagesPerPage);
        this.map.gallery.nav.w = 25*this.map.gallery.pages + 50; //extra 50 for 2 arrows
        this.map.gallery.nav.start = (w - this.map.gallery.nav.w) * 0.5;
        this.map.gallery.nav.y =  h - 0.5 * (h - this.map.gallery.h * 120);
    }
    
    //profile
    if(this.currentItem == null)
    {
        this.profiles.menuCenter = {x: this.canvas.w * 0.5, y: this.canvas.h * 0.5};
        this.profiles.menuSize = 1.0;
    }
    else
    {
        this.profiles.menuCenter = {x: this.canvas.w * 0.2, y: this.canvas.h * 0.75};
        this.profiles.menuSize = 0.25;
    }
    var fit = Math.min(this.canvas.w * 0.3, this.canvas.h * 0.4);
    this.profiles.targetPicPos = {x: this.canvas.w * 0.2 - fit * 0.5, y: this.canvas.h * 0.35 - fit*0.5}
    this.profiles.picPos = {x: this.profiles.targetPicPos.x, y:this.profiles.targetPicPos.y};
    this.profiles.targetPicSize = fit;
    this.profiles.picSize = fit;
    //text div
    $("#profile-text").css({
            
                width : this.canvas.w * 0.5 - 10,
                height : this.canvas.h * 0.65 - 10,
                top : (this.canvas.h - (this.canvas.h * 0.65) )*0.5 + app.header.end,
                left : this.canvas.w*0.4
            });
}

function isinBounds(pos, minX, minY, maxX, maxY)
{
    return (
        pos.x >= minX
        && pos.y >= minY
        && pos.x <= maxX
        && pos.y <= maxY
    );
}