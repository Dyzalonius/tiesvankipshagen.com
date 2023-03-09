<?php
    require_once('assets/Mustache/Autoloader.php');
    Mustache_Autoloader::register();
    $mustache = new Mustache_Engine(array('entity_flags' => ENT_QUOTES));

    $projectsData = json_decode(file_get_contents("assets/data/projects.json"));

    $featuredTemplate = file_get_contents("assets/data/featuredTemplate.mustache");
    $featured = $mustache->render($featuredTemplate, $projectsData);

    $projectsTemplate = file_get_contents("assets/data/projectsTemplate.mustache");
    $projects = $mustache->render($projectsTemplate, $projectsData);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Ties van Kipshagen</title>
    <link rel="shortcut icon" href="./assets/img/img_logo_ties.png">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#000000">
    <meta property="og:url" content="https://www.tiesvankipshagen.com/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Games by Ties">
    <meta property="og:image" content="https://www.tiesvankipshagen.com/assets/img/img_portrait.png">
    <meta property="image" content="https://www.tiesvankipshagen.com/assets/img/img_portrait.png">
    <meta property="og:description" content="Ties van Kipshagen, Game designer.">
    <meta property="description" content="Ties van Kipshagen, Game designer.">

    <link rel="stylesheet" href="./assets/css/normalize.css">
    <link rel="stylesheet" href="./assets/css/index.css">
    <link rel="stylesheet" href="./assets/css/index-1400.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css'>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap">
</head>
<body>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://kit.fontawesome.com/b9743d0c74.js" crossorigin="anonymous"></script>
    <script src="./assets/js/dark-mode.js"></script>
    <script src="./assets/js/game.js"></script>
    <script src="./assets/js/scroll.js"></script>
    <script src="./assets/js/gallery.js"></script>
    <div id="game">
        <canvas id="gameCanvas"></canvas>
    </div>
    <nav id="navbar" class="spacer">
        <div id="navbar-container" class="margins">
            <div class="margins2">
                <span class="navbar-element">
                    <a class="navbar-button" href="#game">GAME</a>
                </span>
                <span class="navbar-element">
                    <a class="navbar-button" href="#featured">FEATURED</a>
                </span>
                <span class="navbar-element">
                    <a class="navbar-button" href="#projects">PROJECTS</a>
                </span>
                <span class="navbar-element">
                    <button id="dark-mode-button" onClick="toggleDarkMode()"><span>🌗</span></button>
                </span>
            </div>
        </div>
    </nav>

    <div class="margins1">
        <div class="margins2">
            <div class="spacer"></div>
            <div id="featured" class="spacer"></div>
            <h1 class="header">Featured</h1>
            <div id="featured-list">
                <?php echo $featured; ?>
            </div>
            <div id="projects" class="spacer"></div>
            <h1 class="header">Projects</h1>
            <div id="project-list">
                <?php echo $projects; ?>
            </div>
            <div class="spacer"></div>
        </div>
    </div>

    <footer id="footer" class="spacer">
        <div id="footer-container" class="margins">
            <div id="footer-list">
                <span>Ties van Kipshagen</span>
                <span>-</span>
                <span class="footer-element">
                    Contact: <a class="navbar-button" href="https://www.linkedin.com/in/ties-van-kipshagen-b31160217/" target="_blank">Linkedin</a>
                </span>
            </div>
        </div>
    </footer>
</body>
</html>
