import './index.css'
console.log('frontend works');

document.addEventListener("DOMContentLoaded", function(_event) { 
    let dynamicContent = document.getElementById("dynamic-content");
    if (dynamicContent) {
        dynamicContent.innerHTML = [
            "<p>This text comes from by <var>/src/frontend/index.ts</var></p>",
            "<p>Very sadly, it won't refresh when I change the index.ts file though.</p>",
            "<code>console.log(\"Lets ask vegarringal to fix this.\");</code>",
        ].join('\n');
    }
    let serverContent = document.getElementById("server-content");
    if (serverContent) {
        serverContent.innerHTML = [
            "<p>This demo uses </p>",
            "<iframe src=\"http://localhost/api/add\"></iframe>",
            "<p class=\"warning\">Next I'll try to add a simple sample here.</p>",
        ].join('\n');
    }    
  });