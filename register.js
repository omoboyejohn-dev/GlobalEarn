/* =========================================
   GlobalEarn Register
   register.js

   USERNAME-BASED REFERRAL SYSTEM

   Referral link example:
   register.html?ref=john123

   When a new user registers:
   referredBy = "john123"

   Reward:
   $3.50 per successful referral
   Maximum: 10 referrals
========================================= */

import {
    auth,
    db
} from "./firebase.js";


/* =========================================
   FIREBASE AUTHENTICATION
========================================= */

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";


/* =========================================
   FIRESTORE
========================================= */

import {
    doc,
    setDoc,
    getDocs,
    collection,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   REFERRAL SETTINGS
========================================= */

const REFERRAL_REWARD = 3.50;

const REFERRAL_LIMIT = 10;


/* =========================================
   GET REFERRER FROM URL
========================================= */

function getReferralUsername() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const ref =
        params.get("ref");


    if (!ref) {
        return "";
    }


    return ref
        .trim()
        .toLowerCase();

}


/* =========================================
   REFERRAL USERNAME
========================================= */

const referralUsername =
    getReferralUsername();


/* =========================================
   AUTO-FILL REFERRAL FIELD
========================================= */

const referralInput =
    document.getElementById(
        "referralCode"
    );


if (
    referralInput &&
    referralUsername
) {

    referralInput.value =
        referralUsername;

}


/* =========================================
   CHECK REFERRER
========================================= */

async function validateReferrer(
    username
) {

    if (!username) {
        return null;
    }


    try {

        const usersRef =
            collection(
                db,
                "users"
            );


        const referralQuery =
            query(
                usersRef,
                where(
                    "username",
                    "==",
                    username
                )
            );


        const snapshot =
            await getDocs(
                referralQuery
            );


        if (
            snapshot.empty
        ) {

            return null;

        }


        const referrerDoc =
            snapshot.docs[0];


        return {
            id:
                referrerDoc.id,

            data:
                referrerDoc.data()

        };


    } catch (error) {

        console.error(
            "Referrer validation error:",
            error
        );

        return null;

    }

}


/* =========================================
   REGISTER FORM
========================================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =========================================
               GET FORM VALUES
            ========================================= */

            const fullName =
                document
                    .getElementById("fullName")
                    ?.value
                    .trim();


            const username =
                document
                    .getElementById("username")
                    ?.value
                    .trim()
                    .toLowerCase();


            const country =
                document
                    .getElementById("country")
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim()
                    .toLowerCase();


            const phone =
                document
                    .getElementById("phone")
                    ?.value
                    .trim();


            /*
             * Referral username can come from:
             *
             * 1. URL
             * 2. Referral input
             */

            const enteredReferral =
                document
                    .getElementById("referralCode")
                    ?.value
                    .trim()
                    .toLowerCase();


            const referredBy =
                enteredReferral ||
                referralUsername ||
                "";


            const password =
                document
                    .getElementById("password")
                    ?.value;


            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    ?.value;


            const terms =
                document.getElementById(
                    "terms"
                );


            /* =========================================
               MESSAGE
            ========================================= */

            const message =
                document.getElementById(
                    "message"
                );


            /* =========================================
               BUTTON
            ========================================= */

            const submitButton =
                document.getElementById(
                    "registerButton"
                );


            const buttonText =
                document.getElementById(
                    "buttonText"
                );


            /* =========================================
               SHOW MESSAGE
            ========================================= */

            function showMessage(
                text,
                type = "error"
            ) {

                if (!message) {
                    return;
                }


                message.textContent =
                    text;


                message.className =
                    "message " + type;


                message.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


            /* =========================================
               REQUIRED FIELDS
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
               USERNAME VALIDATION
            ========================================= */

            if (
                username.length < 3
            ) {

                showMessage(
                    "Username must contain at least 3 characters."
                );

                return;

            }


            /*
             * Only allow:
             * letters
             * numbers
             * underscore
             */

            const usernamePattern =
                /^[a-z0-9_]+$/;


            if (
                !usernamePattern.test(
                    username
                )
            ) {

                showMessage(
                    "Username can only contain letters, numbers, and underscores."
                );

                return;

            }


            /* =========================================
               EMAIL VALIDATION
            ========================================= */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                showMessage(
                    "Please enter a valid email address."
                );

                return;

            }


            /* =========================================
               PASSWORD VALIDATION
            ========================================= */

            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;

            }


            /* =========================================
               CONFIRM PASSWORD
            ========================================= */

            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "Passwords do not match."
                );

                return;

            }


            /* =========================================
               TERMS
            ========================================= */

            if (
                terms &&
                !terms.checked
            ) {

                showMessage(
                    "Please accept the Terms & Conditions."
                );

                return;

            }


            /* =========================================
               PREVENT SELF REFERRAL
            ========================================= */

            if (
                referredBy &&
                referredBy === username
            ) {

                showMessage(
                    "You cannot use your own username as a referral."
                );

                return;

            }


            /* =========================================
               START LOADING
            ========================================= */

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.classList.add(
                    "loading"
                );

            }


            if (buttonText) {

                buttonText.textContent =
                    "Creating Account...";

            }


            /* =========================================
               CREATE ACCOUNT
            ========================================= */

            try {

                /*
                 * Check whether username
                 * already exists.
                 */

                const usersRef =
                    collection(
                        db,
                        "users"
                    );


                const usernameQuery =
                    query(
                        usersRef,
                        where(
                            "username",
                            "==",
                            username
                        )
                    );


                const usernameSnapshot =
                    await getDocs(
                        usernameQuery
                    );


                if (
                    !usernameSnapshot.empty
                ) {

                    showMessage(
                        "This username is already taken. Please choose another."
                    );

                    return;

                }


                /* =========================================
                   VALIDATE REFERRER
                ========================================= */

                let referrer = null;


                if (referredBy) {

                    referrer =
                        await validateReferrer(
                            referredBy
                        );


                    if (!referrer) {

                        showMessage(
                            "The referral username does not exist."
                        );

                        return;

                    }

                }


                /* =========================================
                   CREATE FIREBASE AUTH ACCOUNT
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
                   UPDATE AUTH PROFILE
                ========================================= */

                await updateProfile(
                    user,
                    {
                        displayName:
                            fullName
                    }
                );


                /* =========================================
                   CREATE USER DOCUMENT
                ========================================= */

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        uid:
                            user.uid,

                        fullName:
                            fullName,

                        username:
                            username,

                        country:
                            country,

                        email:
                            email,

                        phone:
                            phone,

                        /*
                         * Username of the person
                         * who referred this user.
                         */

                        referredBy:
                            referredBy || null,

                        /*
                         * Each user's own username
                         * is their referral identifier.
                         */

                        myReferralCode:
                            username,

                        balance:
                            50,

                        welcomeBonus:
                            50,

                        referralEarnings:
                            0,

                        referralCount:
                            0,

                        taskEarnings:
                            0,

                        totalWithdrawn:
                            0,

                        accountStatus:
                            "active",

                        createdAt:
                            serverTimestamp()

                    }
                );


                /* =========================================
                   SUCCESS MESSAGE
                ========================================= */

                showMessage(
                    referredBy
                        ? "Account created successfully! Your referral has been recorded."
                        : "Account created successfully! Redirecting to your dashboard...",
                    "success"
                );


                /* =========================================
                   REDIRECT
                ========================================= */

                setTimeout(
                    () => {

                        window.location.href =
                            "dashboard.html";

                    },
                    1800
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                /* =========================================
                   DEFAULT ERROR
                ========================================= */

                let errorMessage =
                    "Unable to create your account. Please try again.";


                /* =========================================
                   FIREBASE ERRORS
                ========================================= */

                switch (
                    error.code
                ) {

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


                    case "auth/too-many-requests":

                        errorMessage =
                            "Too many attempts. Please wait and try again.";

                        break;


                    default:

                        if (
                            error.message
                        ) {

                            errorMessage =
                                error.message;

                        }

                }


                showMessage(
                    errorMessage
                );


            } finally {

                /* =========================================
                   STOP LOADING
                ========================================= */

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.classList.remove(
                        "loading"
                    );

                }


                if (buttonText) {

                    buttonText.textContent =
                        "Create Account";

                }

            }

        }
    );

}


/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach(
        button => {

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


                    if (!input) {
                        return;
                    }


                    /* SHOW */

                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        this.innerHTML =
                            '<i class="fa-solid fa-eye-slash"></i>';


                        this.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    }


                    /* HIDE */

                    else {

                        input.type =
                            "password";


                        this.innerHTML =
                            '<i class="fa-solid fa-eye"></i>';


                        this.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }
    );
