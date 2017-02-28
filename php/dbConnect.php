<?php

$dbLink = new mysqli('localhost', 'community', 'communitypwd', 'community_data');

if($dbLink->connect_error)
{
    //database connection failed
    unset($dbLink);
    return;
}

?>