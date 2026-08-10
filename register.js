/* =========================================
   GlobalEarn Register
   register.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================
   REGISTER FORM
========================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* =========================================
           GET FORM VALUES
        ========================================= */

        const fullName =
            document.getElementById("fullName")?.value.trim();

        const username =
            document.getElementById("username")?.value.trim();

        const country =
            document.getElementById("country")?.value.trim();

        const referral =
            document.getElementById("referral")?.value.trim();

        const email =
            document.getElementById("email")?.value.trim();

        const phone =
            document.getElementById("phone")?.value.trim();

        const password =
            document.getElementById("password")?.value;

        const confirmPassword =
            document.getElementById("confirmPassword")?.value;

        const terms =
            document.getElementById("terms");


        /* =========================================
           MESSAGE ELEMENT
        ========================================= */

        const message =
            document.getElementById("message");


        /* =========================================
           BUTTON
        ========================================= */

        const submitButton =
            document.querySelector(".register-submit");

        const buttonText =
            document.getElementById("buttonText");


        /* =========================================
           HELPER: SHOW MESSAGE
        ========================================= */

        function showMessage(text, type = "error") {

            if (!message) return;

            message.textContent = text;

            message.className = "message " + type;

            message.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }


        /* =========================================
           VALIDATION
        ========================================= */

        if (
            !fullName ||
            !username ||
            !country ||
            !email ||
            !phone ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Please complete all required fields."
            );

            return;
        }


        /* =========================================
           EMAIL VALIDATION
        ========================================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showMessage(
                "Please enter a valid email address."
            );

            return;
        }


        /* =========================================
           PASSWORD VALIDATION
        ========================================= */

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }


        /* =========================================
           CONFIRM PASSWORD
        ========================================= */

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match."
            );

            return;
        }


        /* =========================================
           TERMS
        ========================================= */

        if (terms && !terms.checked) {

            showMessage(
                "Please accept the Terms & Conditions."
            );

            return;
        }


        /* =========================================
           START LOADING
        ========================================= */

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.classList.add("loading");
        }


        if (buttonText) {

            buttonText.textContent =
                "Creating Account...";
        }


        try {

            /* =========================================
               CREATE FIREBASE ACCOUNT
            ========================================= */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            /* =========================================
               UPDATE DISPLAY NAME
            ========================================= */

            await updateProfile(user, {

                displayName: fullName

            });


            /* =========================================
               CREATE USER DATABASE RECORD
            ========================================= */

            await setDoc(
                doc(db, "users", user.uid),
                {

                    uid: user.uid,

                    fullName: fullName,

                    username: username,

                    country: country,

                    referralCode:
                        referral || null,

                    email: email,

                    phone: phone,

                    balance: 50,

                    welcomeBonus: 50,

                    referralEarnings: 0,

                    taskEarnings: 0,

                    totalWithdrawn: 0,

                    accountStatus: "active",

                    createdAt:
                        serverTimestamp()

                }
            );


            /* =========================================
               SUCCESS
            ========================================= */

            showMessage(
                "Account created successfully! Redirecting to your dashboard...",
                "success"
            );


            /* =========================================
               REDIRECT
            ========================================= */

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1800);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            /* =========================================
               FIREBASE ERROR MESSAGES
            ========================================= */

            let errorMessage =
                "Unable to create your account. Please try again.";


            switch (error.code) {

                case "auth/email-already-in-use":

                    errorMessage =
                        "This email address is already registered.";

                    break;


                case "auth/invalid-email":

                    errorMessage =
                        "Please enter a valid email address.";

                    break;


                case "auth/weak-password":

                    errorMessage =
                        "Your password is too weak. Use at least 6 characters.";

                    break;


                case "auth/network-request-failed":

                    errorMessage =
                        "Network error. Please check your internet connection.";

                    break;


                case "auth/operation-not-allowed":

                    errorMessage =
                        "Email/password registration is not enabled in Firebase.";

                    break;


                default:

                    errorMessage =
                        error.message ||
                        errorMessage;

            }


            showMessage(errorMessage);


        } finally {

            /* =========================================
               STOP LOADING
            ========================================= */

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.classList.remove("loading");

            }

            if (buttonText) {

                buttonText.textContent =
                    "Create Account";

            }

        }

    });

}


/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", function () {

            const inputId =
                this.getAttribute("data-target");

            const input =
                document.getElementById(inputId);

            if (!input) return;


            if (input.type === "password") {

                input.type = "text";

                this.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            } else {

                input.type = "password";

                this.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

            }

        });

    });
