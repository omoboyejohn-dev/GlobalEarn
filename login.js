/* =========================================
   GlobalEarn Login
   login.js
========================================= */

import {
    auth
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";


/* =========================================
   LOGIN FORM
========================================= */

const loginForm =
    document.getElementById("loginForm");

const message =
    document.getElementById("message");

const submitButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(
    text,
    type = "error"
) {

    if (!message) return;

    message.textContent = text;

    message.className =
        "message " + type;

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================
   LOGIN FORM SUBMIT
========================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =================================
               GET VALUES
            ================================= */

            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    ?.value;


            const rememberMe =
                document.getElementById(
                    "rememberMe"
                );


            /* =================================
               VALIDATION
            ================================= */

            if (!email || !password) {

                showMessage(
                    "Please enter your email and password."
                );

                return;

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showMessage(
                    "Please enter a valid email address."
                );

                return;

            }


            /* =================================
               START LOADING
            ================================= */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.classList.add(
                    "loading"
                );

            }


            if (buttonText) {

                buttonText.textContent =
                    "Logging in...";

            }


            try {

                /* =================================
                   FIREBASE LOGIN
                ================================= */

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                /* =================================
                   SUCCESS
                ================================= */

                showMessage(
                    "Login successful! Redirecting to your dashboard...",
                    "success"
                );


                /* =================================
                   REMEMBER LOGIN
                ================================= */

                /*
                   Firebase normally keeps the user
                   signed in automatically.

                   The checkbox is retained here for
                   future persistence settings.
                */

                if (rememberMe?.checked) {

                    localStorage.setItem(
                        "globalEarnRemember",
                        "true"
                    );

                } else {

                    localStorage.removeItem(
                        "globalEarnRemember"
                    );

                }


                /* =================================
                   REDIRECT
                ================================= */

                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                /* =================================
                   FIREBASE ERROR HANDLING
                ================================= */

                let errorMessage =
                    "Unable to login. Please try again.";


                switch (error.code) {


                    case "auth/invalid-credential":

                        errorMessage =
                            "Incorrect email or password.";

                        break;


                    case "auth/invalid-email":

                        errorMessage =
                            "Please enter a valid email address.";

                        break;


                    case "auth/user-disabled":

                        errorMessage =
                            "This account has been disabled. Please contact support.";

                        break;


                    case "auth/user-not-found":

                        errorMessage =
                            "No account was found with this email address.";

                        break;


                    case "auth/wrong-password":

                        errorMessage =
                            "Incorrect password.";

                        break;


                    case "auth/network-request-failed":

                        errorMessage =
                            "Network error. Please check your internet connection.";

                        break;


                    case "auth/too-many-requests":

                        errorMessage =
                            "Too many login attempts. Please wait and try again.";

                        break;


                    default:

                        if (error.message) {

                            errorMessage =
                                error.message;

                        }

                }


                showMessage(
                    errorMessage
                );


            } finally {

                /* =================================
                   STOP LOADING
                ================================= */

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.classList.remove(
                        "loading"
                    );

                }


                if (buttonText) {

                    buttonText.textContent =
                        "Login";

                }

            }

        }
    );

}



/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {


                const inputId =
                    this.getAttribute(
                        "data-target"
                    );


                const input =
                    document.getElementById(
                        inputId
                    );


                if (!input) return;


                if (
                    input.type === "password"
                ) {

                    input.type = "text";


                    this.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';


                    this.setAttribute(
                        "aria-label",
                        "Hide password"
                    );


                } else {

                    input.type = "password";


                    this.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';


                    this.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    });



/* =========================================
   CHECK CURRENT AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    (user) => {

        /*
         * We don't automatically redirect here
         * because a user may intentionally visit
         * the login page.
         */

        if (user) {

            console.log(
                "Firebase user already signed in:",
                user.uid
            );

        }

    }
);
