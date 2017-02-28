var canvas, 
    app,
    loadingImg = {};


function onLoad()
{
    //events
    $("html").on("mousewheel", onScroll);
    $(window).on("resize", onResize);

    //startup app with jQuery objs
    app = new CommunityApp();
    app.init( $("#header"), $("#media-canvas"), $("#main-text") );
    
    //loading sprite
    loadingImg.frame = 0;
    loadingImg.frames = 25;
    loadingImg.size = 120;
    loadingImg.img = $("#loading-image")[0];
    
    $("#rob-sing")[0].pause();
    
    //start main loop
    window.requestAnimationFrame(loop);
    
    //set initial sizes
    onResize();
}

function loop()
{
    window.requestAnimationFrame(loop);
    
    loadingImg.frame = (loadingImg.frame < loadingImg.frames-1) ? loadingImg.frame +1 : 0;
    
    app.update();
    app.render();
}

function onResize()
{
    w = parseInt($("body").css("width"));
    h = parseInt($("body").css("height"));
    
    app.onResize(w, h);
}

function onScroll(e)
{
    if( $(e.target).is("#profile-text") || $(e.target).parent().is("#profile-text"))
        return;
    var delta = -(e.originalEvent.wheelDelta/120);
    
    app.onScroll( delta );
}

function drawLoader(ctx, x, y, w, h)
{
    ctx.drawImage(loadingImg.img, 
                  loadingImg.size * loadingImg.frame,
                  0,
                  loadingImg.size, loadingImg.size,
                  x, y, w, h);
}

function toggleRobSing() 
{
    var audio = $('#rob-sing')[0]; 
    if(audio.paused || audio.preload == 'none') 
    {
        audio.preload = 'auto';
        audio.play(); 
        $("#rob-play-pause").html('Pause'); 
    } 
    else 
    {
        audio.pause(); 
        $("#rob-play-pause").html('Play');
    }
}