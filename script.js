// ===============================
// GlobalEarn JavaScript
// ===============================

// Sticky Header
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        header.style.background = "rgba(8,15,25,0.95)";
        header.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";
    } else {
        header.style.background = "rgba(15,20,30,.75)";
        header.style.boxShadow = "none";
    }
});

// Smooth Scroll Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({
                behavior:"smooth"
            });

        }

    });

});

// Fade Animation
const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

},{
    threshold:0.15
});

document.querySelectorAll(".card,.step,.task,.feature").forEach(el=>{

    el.style.opacity="0";
    el.style.transform="translateY(40px)";
    el.style.transition=".8s";

    observer.observe(el);

});

// Button Animation
document.querySelectorAll("a").forEach(btn=>{

    btn.addEventListener("mouseenter",()=>{

        btn.style.transition=".3s";

    });

});

// Welcome Message
console.log("Welcome to GlobalEarn");

// Current Year
const copyright = document.querySelector(".copyright");

if(copyright){

    copyright.innerHTML =
    `© ${new Date().getFullYear()} GlobalEarn. All Rights Reserved.`;

}
