import './index.css'

// This code runs in the browser.

document.addEventListener("DOMContentLoaded", function(_event) { 
    let dynamicContent = document.getElementById("dynamic-content");
    if (dynamicContent) {
        dynamicContent.innerHTML = [
            "<p>This text comes from by <var>/src/frontend/index.ts</var></p>",
            "<p>Again editing the file will, near instantaneously, refresh your page.</p>",
            "<p>Isn'it totally awesome?</p>",
            ""
        ].join('\n');
    }
});