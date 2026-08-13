/* =========================================
   GlobalEarn Register
   register.js

   Username Referral System

   Referral link:
   register.html?ref=username

   Referral reward:
   $3.50 per successful referral
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const registerForm =
    document.getElementById("registerForm");

const referralInput =
    document.getElementById("referralCode");


/* =========================================
   GET REFERRAL FROM URL
========================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const referralFromURL =
    urlParams
        .get("ref")
        ?.trim()
        .toLowerCase();


/* =========================================
   AUTO-FILL REFERRAL USERNAME
========================================= */

if (
    referralInput &&
    referralFromURL
) {

    referralInput.value =
        referralFromURL;

    /*
     * Referral came from a referral link,
     * so don't allow the visitor to
     * accidentally change it.
     */

    referralInput.readOnly = true;

}


/* =========================================
   REGISTER FORM
========================================= */

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
             * Referral username.
             *
             * Priority:
             * 1. URL ?ref=username
             * 2. Referral input
             */

            const referredBy =
                (
                    referralFromURL ||
                    referralInput?.value ||
                    ""
                )
                .trim()
                .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    ?.value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    ?.value;


            const terms =
                document.getElementById("terms");


            /* =========================================
               MESSAGE
            ========================================== */

            const message =
                document.getElementById("message");


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
            ========================================== */

            function showMessage(
                text,
                type = "error"
            ) {

                if (!message) return;

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
            ========================================== */

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
            ========================================== */

            if (
                username.length < 3
            ) {

                showMessage(
                    "Username must contain at least 3 characters."
                );

                return;

            }


            const usernamePattern =
                /^[a-z0-9_]+$/;


            if (
                !usernamePattern.test(
                    username
                )
            ) {

                showMessage(
                    "Username can only contain letters, numbers and underscores."
                );

                return;

            }


            /* =========================================
               EMAIL VALIDATION
            ========================================== */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                showMessage(
                    "Please enter a valid email address."
                );

                return;

            }


            /* =========================================
               PASSWORD
            ========================================== */

            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;

            }


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
            ========================================== */

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
               CHECK USERNAME
            ========================================== */

            try {

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


            } catch (error) {

                console.error(
                    "Username check error:",
                    error
                );

                showMessage(
                    "Unable to verify username. Please try again."
                );

                return;

            }


            /* =========================================
               VERIFY REFERRER
            ========================================== */

            let validReferral =
                null;


            if (referredBy) {

                try {

                    const usersRef =
                        collection(
                            db,
                            "users"
                        );


                    const referrerQuery =
                        query(
                            usersRef,
                            where(
                                "username",
                                "==",
                                referredBy
                            )
                        );


                    const referrerSnapshot =
                        await getDocs(
                            referrerQuery
                        );


                    if (
                        referrerSnapshot.empty
                    ) {

                        showMessage(
                            "The referral username does not exist."
                        );

                        return;

                    }


                    /*
                     * Prevent self-referral.
                     */

                    if (
                        referredBy ===
                        username
                    ) {

                        showMessage(
                            "You cannot refer yourself."
                        );

                        return;

                    }


                    validReferral =
                        referredBy;


                } catch (error) {

                    console.error(
                        "Referral verification error:",
                        error
                    );

                    showMessage(
                        "Unable to verify referral. Please try again."
                    );

                    return;

                }

            }


            /* =========================================
               START LOADING
            ========================================== */

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
               CREATE FIREBASE AUTH ACCOUNT
            ========================================== */

            try {

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
                   CREATE FIRESTORE USER
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
                            validReferral,

                        /*
                         * Keep this field for
                         * compatibility with
                         * existing data.
                         */

                        referralCode:
                            validReferral,

                        /*
                         * Referral system.
                         */

                        referralCount:
                            0,

                        referralEarnings:
                            0,

                        /*
                         * Account earnings.
                         */

                        balance:
                            50,

                        welcomeBonus:
                            50,

                        taskEarnings:
                            0,

                        totalWithdrawn:
                            0,

                        accountStatus:
                            "active",

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
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


                let errorMessage =
                    "Unable to create your account. Please try again.";


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


                    if (!input) return;


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

                    } else {

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
