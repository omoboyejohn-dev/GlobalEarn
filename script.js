// ======================================
// GlobalEarn JavaScript
// ======================================

// Sticky Header

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.background = "#081420";
        header.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";

    } else {

        header.style.background = "rgba(7,19,31,.92)";
        header.style.boxShadow = "none";

    }

});

// Smooth Scroll

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e){

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});

// Scroll Reveal

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.style.opacity="1";

            entry.target.style.transform="translateY(0)";

        }

    });

},{
    threshold:0.2
});

document.querySelectorAll(".stat-card,.feature-card,.task-card,.withdraw-card,.faq-card").forEach(card=>{

    card.style.opacity="0";

    card.style.transform="translateY(40px)";

    card.style.transition=".6s ease";

    observer.observe(card);

});

// Animated Counter

const counters = document.querySelectorAll(".stat-info h2");

let started = false;

function startCounter(){

    if(started) return;

    started = true;

    counters.forEach(counter=>{

        const targetText = counter.innerText;

        const target = parseInt(targetText.replace(/\D/g,""));

        let count = 0;

        const speed = target / 100;

        const update = ()=>{

            count += speed;

            if(count < target){

                if(targetText.includes("$")){

                    counter.innerText="$"+Math.floor(count)+"M+";

                }else{

                    counter.innerText=Math.floor(count)+"+";

                }

                requestAnimationFrame(update);

            }else{

                counter.innerText=targetText;

            }

        };

        update();

    });

}

window.addEventListener("scroll",()=>{

    const stats=document.querySelector(".statistics");

    if(stats){

        const top=stats.getBoundingClientRect().top;

        if(top<window.innerHeight-100){

            startCounter();

        }

    }

});

// Back To Top Button

const backTop=document.querySelector(".back-top");

window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        backTop.style.display="flex";

    }else{

        backTop.style.display="none";

    }

});

// Floating Icons

document.querySelectorAll(".floating").forEach((icon,index)=>{

    icon.animate([

        {transform:"translateY(0px)"},

        {transform:"translateY(-20px)"},

        {transform:"translateY(0px)"}

    ],{

        duration:3000+(index*500),

        iterations:Infinity

    });

});

console.log("🌍 GlobalEarn Loaded Successfully");
