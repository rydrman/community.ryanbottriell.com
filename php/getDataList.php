<?php

ini_set('display_errors', 'On');

require 'dbConnect.php';

if(!isset($dbLink))
{
    echo("Error: No established connection to database");
    return;
}

//first get all images
//$sql = "SELECT * FROM images";
$sql = "SELECT i.*, l.name, l.mapX, l.mapY FROM images AS i LEFT JOIN locations AS l ON i.location = l.id";

$result = $dbLink->query($sql);

if(!$result)
{
    echo("Query rejected: ". mysqli_error($dbLink));
    return;
}

//populate images
$out = "{ \"images\" : [";
$base = "../content/images/";
$first = true;
while($image = $result->fetch_assoc())
{
    if($first)
        $first = false;
    else
        $out .= ", ";
    
    $out .= "{";
        $out .= "\"id\" : ".$image['id'].", ";
        $out .= "\"file\" : \"";
        $out .= $base.$image['filename'];
        $out .= "\", \"thumb\" : \"";
        $out .= $base."thumbs/".$image['filename'];
        $out .= "\", \"tags\" : \"";
        $out .= $image['tags'];
        $out .= "\", \"location\" : \"";
        $out .= $image['name'];
        $out .= "\", \"mapX\" : \"";
        $out .= $image['mapX'];
        $out .= "\", \"mapY\" : \"";
        $out .= $image['mapY'];
    $out .= "\"}";
}
$out .= "], ";

$result->free();

//first get all profiles
$sql = "SELECT * FROM profiles";

$result = $dbLink->query($sql);

if(!$result)
{
    echo("Query rejected: ". mysql_error());
    return;
}

$out .= "\"profiles\" : [";
$base = "../content/images/profiles/";
$first = true;
while($profile = $result->fetch_assoc())
{
    if($first)
        $first = false;
    else
        $out .= ", ";
    
    $out .= "{";
        $out .= "\"id\" : ".$profile['id'].", ";
        $out .= "\"name\" : \"";
        $out .= $profile['name'];
        $out .= "\", \"icon1\" : \"";
        $out .= $base.$profile['name']."_n.png";
        $out .= "\", \"icon2\" : \"";
        $out .= $base.$profile['name']."_o.png";
        $out .= "\", \"iconFull\" : \"";
        $out .= $base.$profile['name']."_f.png";
        $out .= "\", \"video\" : \"";
        $out .= "../content/video/".$profile['name'].".mp4";
    $out .= "\"}";
}
$out .= "]}";


echo($out);

require 'dbClose.php';

?>
