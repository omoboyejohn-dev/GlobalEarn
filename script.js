// ==============================
// GlobalEarn JavaScript
// ==============================

// Sticky Header

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.background = "#08121d";
        header.style.boxShadow = "0 10px 25px rgba(0,0,0,.4)";

    } else {

        header.style.background = "rgba(5,15,25,.88)";
        header.style.boxShadow = "none";

    }

});

// Smooth Scroll

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

// Statistics Counter

const counters = document.querySelectorAll(".stat-card h2");

const speed = 150;

counters.forEach(counter => {

    const updateCount = () => {

        const target = counter.innerText.replace(/\D/g, "");

        const count = +counter.getAttribute("data-count") || 0;

        const increment = target / speed;

        if (count < target) {

            const newCount = Math.ceil(count + increment);

            counter.setAttribute("data-count", newCount);

            counter.innerText = newCount.toLocaleString() + "+";

            setTimeout(updateCount, 20);

        } else {

            if (counter.innerText.includes("$")) {

                counter.innerText = "$20M+";

            }

        }

    };

    updateCount();

});

// Fade In Animation

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold: 0.15

});

document.querySelectorAll(".stat-card, .step-card, .feature-card, .task-card, .crypto-card").forEach(el => {

    observer.observe(el);

});

// Hero Image Floating Effect

const heroImage = document.querySelector(".hero-right img");

if (heroImage) {

    let angle = 0;

    setInterval(() => {

        angle += 0.03;

        heroImage.style.transform =
            `translateY(${Math.sin(angle) * 12}px)`;

    }, 20);

}

// Button Hover Effect

document.querySelectorAll(".register-btn,.start-btn").forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transform = "scale(1.05)";

    });

    btn.addEventListener("mouseleave", () => {

        btn.style.transform = "scale(1)";

    });

});

console.log("🌍 GlobalEarn Loaded Successfully");
