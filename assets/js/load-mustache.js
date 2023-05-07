$(document).ready(function() {
    fetch('assets/templates/featuredTemplate.mustache')
        .then((response) => response.text())
        .then((template) => {
        const rendered = Mustache.render(template, projectData);
        $("#featured-list").html(rendered);
    });

    fetch('assets/templates/projectsTemplate.mustache')
        .then((response) => response.text())
        .then((template) => {
        const rendered = Mustache.render(template, projectData);
        $("#project-list").html(rendered);
    });
});
