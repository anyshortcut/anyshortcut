
let headingPositions = [];
let currentHeading = "";
document.addEventListener('scroll', onHeadingPositionChanged, false);
window.addEventListener('hashchange', onHeadingPositionChanged, false);

function onHeadingPositionChanged() {
    document.querySelectorAll('h4').forEach(item => {
        headingPositions[item.id] = item.getBoundingClientRect().top;
    });
    headingPositions.sort();

    // the headings have all been grabbed and sorted in order of their scroll
    // position (from the top of the page). First one is toppermost.
    for (let key in headingPositions) {
        if (headingPositions[key] >= 0 && headingPositions[key] <= 200) {
            if (currentHeading !== key) {
                // a new heading has scrolled to within 200px of the top of the page.
                // highlight the right-nav entry and de-highlight the others.
                highlightMenuLink(key);
                currentHeading = key;
            }
            break;
        }
    }
}

function highlightMenuLink(heading) {
    let currentUrl = document.location.protocol + "//" + document.location.hostname
        + document.location.pathname + "#" + heading;
    document.querySelectorAll('.menu-link').forEach(link => {
        console.log(link.href);
        if (link.href === currentUrl) {
            link.classList.add('is-active');
        } else {
            link.classList.remove('is-active');
        }
    });
}