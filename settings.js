/* =========================================
   GlobalEarn Settings
   settings.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    updatePassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

/* Account information */

const settingsEmail =
    document.getElementById("settingsEmail");

const settingsUsername =
    document.getElementById("settingsUsername");

const settingsCountry =
    document.getElementById("settingsCountry");


/* Name */

const editNameButton =
    document.getElementById("editNameButton");

const nameModal =
    document.getElementById("nameModal");

const closeNameModal =
    document.getElementById("closeNameModal");

const nameForm =
    document.getElementById("nameForm");

const newFullName =
    document.getElementById("newFullName");

const saveNameButton =
    document.getElementById("saveNameButton");

const nameMessage =
    document.getElementById("nameMessage");


/* Password */

const editPasswordButton =
    document.getElementById("editPasswordButton");

const passwordModal =
    document.getElementById("passwordModal");

const closePasswordModal =
    document.getElementById("closePasswordModal");

const passwordForm =
    document.getElementById("passwordForm");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const savePasswordButton =
    document.getElementById("savePasswordButton");

const passwordMessage =
    document.getElementById("passwordMessage");


/* Logout */

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================
   CURRENT USER
========================================= */

let currentUser = null;


/* =========================================
   MESSAGE HELPERS
========================================= */

function showNameMessage(
    message,
    type = "error"
) {

    if (!nameMessage) return;

    nameMessage.textContent =
        message;

    nameMessage.className =
        `modal-message ${type}`;

    nameMessage.hidden =
        false;

}


function hideNameMessage() {

    if (!nameMessage) return;

    nameMessage.hidden =
        true;

}


function showPasswordMessage(
    message,
    type = "error"
) {

    if (!passwordMessage) return;

    passwordMessage.textContent =
        message;

    passwordMessage.className =
        `modal-message ${type}`;

    passwordMessage.hidden =
        false;

}


function hidePasswordMessage() {

    if (!passwordMessage) return;

    passwordMessage.hidden =
        true;

}


/* =========================================
   LOAD ACCOUNT INFORMATION
========================================= */

async function loadUserData(user) {

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            console.error(
                "User document not found."
            );

            if (settingsEmail) {
                settingsEmail.textContent =
                    "Unavailable";
            }

            if (settingsUsername) {
                settingsUsername.textContent =
                    "Unavailable";
            }

            if (settingsCountry) {
                settingsCountry.textContent =
                    "Unavailable";
            }

            return;

        }


        const userData =
            userSnapshot.data();


        /* =====================================
           EMAIL
        ===================================== */

        if (settingsEmail) {

            settingsEmail.textContent =
                userData.email ||
                user.email ||
                "Not available";

        }


        /* =====================================
           USERNAME
        ===================================== */

        if (settingsUsername) {

            settingsUsername.textContent =
                userData.username ||
                "Not available";

        }


        /* =====================================
           COUNTRY
        ===================================== */

        if (settingsCountry) {

            settingsCountry.textContent =
                userData.country ||
                "Not available";

        }


        /* =====================================
           FULL NAME
        ===================================== */

        if (newFullName) {

            newFullName.value =
                userData.fullName ||
                user.displayName ||
                "";

        }


    } catch (error) {

        console.error(
            "Settings load error:",
            error
        );


        if (settingsEmail) {

            settingsEmail.textContent =
                "Unable to load";

        }


        if (settingsUsername) {

            settingsUsername.textContent =
                "Unable to load";

        }


        if (settingsCountry) {

            settingsCountry.textContent =
                "Unable to load";

        }

    }

}


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser =
            user;


        await loadUserData(
            user
        );

    }
);


/* =========================================
   OPEN NAME MODAL
========================================= */

if (editNameButton) {

    editNameButton.addEventListener(
        "click",
        () => {

            hideNameMessage();


            if (nameModal) {

                nameModal.hidden =
                    false;

            }


            newFullName?.focus();

        }
    );

}


/* =========================================
   CLOSE NAME MODAL
========================================= */

if (closeNameModal) {

    closeNameModal.addEventListener(
        "click",
        () => {

            if (nameModal) {

                nameModal.hidden =
                    true;

            }

            hideNameMessage();

        }
    );

}


/* =========================================
   CLOSE NAME MODAL
   CLICK OUTSIDE
========================================= */

if (nameModal) {

    nameModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                nameModal
            ) {

                nameModal.hidden =
                    true;

                hideNameMessage();

            }

        }
    );

}


/* =========================================
   SAVE FULL NAME
========================================= */

if (nameForm) {

    nameForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hideNameMessage();


            if (!currentUser) {

                showNameMessage(
                    "Please log in again."
                );

                return;

            }


            const fullName =
                newFullName?.value
                    ?.trim() ||
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (!fullName) {

                showNameMessage(
                    "Please enter your full name."
                );

                newFullName?.focus();

                return;

            }


            if (
                fullName.length < 2
            ) {

                showNameMessage(
                    "Your full name must contain at least 2 characters."
                );

                newFullName?.focus();

                return;

            }


            /* =================================
               LOADING
            ================================= */

            saveNameButton.disabled =
                true;

            saveNameButton.textContent =
                "Saving...";


            try {

                const userRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );


                /* =================================
                   FIRESTORE
                ================================= */

                await updateDoc(
                    userRef,
                    {

                        fullName:
                            fullName,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* =================================
                   FIREBASE AUTH
                ================================= */

                await updateProfile(
                    currentUser,
                    {
                        displayName:
                            fullName
                    }
                );


                showNameMessage(
                    "Your full name has been updated successfully.",
                    "success"
                );


                /*
                 * Close after success.
                 */

                setTimeout(
                    () => {

                        if (nameModal) {

                            nameModal.hidden =
                                true;

                        }


                        hideNameMessage();

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Name update error:",
                    error
                );


                showNameMessage(
                    "Unable to update your full name. Please try again."
                );

            } finally {

                saveNameButton.disabled =
                    false;

                saveNameButton.textContent =
                    "Save Changes";

            }

        }
    );

}


/* =========================================
   OPEN PASSWORD MODAL
========================================= */

if (editPasswordButton) {

    editPasswordButton.addEventListener(
        "click",
        () => {

            hidePasswordMessage();


            if (passwordForm) {

                passwordForm.reset();

            }


            if (passwordModal) {

                passwordModal.hidden =
                    false;

            }


            newPassword?.focus();

        }
    );

}


/* =========================================
   CLOSE PASSWORD MODAL
========================================= */

if (closePasswordModal) {

    closePasswordModal.addEventListener(
        "click",
        () => {

            if (passwordModal) {

                passwordModal.hidden =
                    true;

            }

            hidePasswordMessage();

        }
    );

}


/* =========================================
   CLOSE PASSWORD MODAL
   CLICK OUTSIDE
========================================= */

if (passwordModal) {

    passwordModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                passwordModal
            ) {

                passwordModal.hidden =
                    true;

                hidePasswordMessage();

            }

        }
    );

}


/* =========================================
   CHANGE PASSWORD
========================================= */

if (passwordForm) {

    passwordForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            hidePasswordMessage();


            if (!currentUser) {

                showPasswordMessage(
                    "Please log in again."
                );

                return;

            }


            const password =
                newPassword?.value ||
                "";


            const confirm =
                confirmPassword?.value ||
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (!password) {

                showPasswordMessage(
                    "Please enter your new password."
                );

                newPassword?.focus();

                return;

            }


            if (
                password.length < 6
            ) {

                showPasswordMessage(
                    "Password must contain at least 6 characters."
                );

                newPassword?.focus();

                return;

            }


            if (
                password !==
                confirm
            ) {

                showPasswordMessage(
                    "Passwords do not match."
                );

                confirmPassword?.focus();

                return;

            }


            /* =================================
               LOADING
            ================================= */

            savePasswordButton.disabled =
                true;

            savePasswordButton.textContent =
                "Updating...";


            try {

                await updatePassword(
                    currentUser,
                    password
                );


                showPasswordMessage(
                    "Your password has been updated successfully.",
                    "success"
                );


                if (newPassword) {

                    newPassword.value =
                        "";

                }


                if (confirmPassword) {

                    confirmPassword.value =
                        "";

                }


                /*
                 * Close modal after success.
                 */

                setTimeout(
                    () => {

                        if (passwordModal) {

                            passwordModal.hidden =
                                true;

                        }

                        hidePasswordMessage();

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Password update error:",
                    error
                );


                let message =
                    "Unable to update your password.";


                switch (
                    error.code
                ) {

                    case "auth/requires-recent-login":

                        message =
                            "For security, please log out and log in again before changing your password.";

                        break;


                    case "auth/weak-password":

                        message =
                            "Your password is too weak. Use at least 6 characters.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Network error. Please check your internet connection.";

                        break;


                    case "auth/user-disabled":

                        message =
                            "This account has been disabled.";

                        break;


                    default:

                        message =
                            "Unable to update your password. Please try again.";

                }


                showPasswordMessage(
                    message
                );


            } finally {

                savePasswordButton.disabled =
                    false;

                savePasswordButton.textContent =
                    "Update Password";

            }

        }
    );

}


/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

document
    .querySelectorAll(
        ".toggle-password"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        this.getAttribute(
                            "data-target"
                        );


                    const input =
                        document.getElementById(
                            target
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


/* =========================================
   ESC KEY - CLOSE MODALS
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        if (
            nameModal &&
            !nameModal.hidden
        ) {

            nameModal.hidden =
                true;

            hideNameMessage();

        }


        if (
            passwordModal &&
            !passwordModal.hidden
        ) {

            passwordModal.hidden =
                true;

            hidePasswordMessage();

        }

    }
);


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            logoutButton.disabled =
                true;


            logoutButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Logging out...
            `;


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerHTML = `
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Logout
                `;

            }

        }
    );

}
