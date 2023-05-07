$(document).ready(function() {
    fetch('assets/data/featuredTemplate.mustache')
        .then((response) => response.text())
        .then((template) => {
        const rendered = Mustache.render(template, projectData);
        $("#featured-list").html(rendered);
    });

    fetch('assets/data/projectsTemplate.mustache')
        .then((response) => response.text())
        .then((template) => {
        const rendered = Mustache.render(template, projectData);
        $("#project-list").html(rendered);
    });
});
