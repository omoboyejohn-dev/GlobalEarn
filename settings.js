/* =========================================
   GlobalEarn Settings
   settings.js

   Editable:
   - Full Name
   - Password

   Locked:
   - Username
   - Email
   - Country
   - Phone
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
   CURRENT USER
========================================= */

let currentUser = null;


/* =========================================
   HELPERS
========================================= */

function getElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;
}


function setElementValue(element, value) {

    if (!element) return;

    const safeValue =
        value ?? "";


    /*
     * Input / textarea / select
     */

    if (
        "value" in element
    ) {

        element.value =
            safeValue;

        return;

    }


    /*
     * Normal text element
     */

    element.textContent =
        safeValue;

}


/* =========================================
   ELEMENTS
========================================= */

/* Profile */

const fullNameInput =
    getElement(
        "fullName"
    );

const usernameInput =
    getElement(
        "username"
    );

const emailInput =
    getElement(
        "email"
    );

const countryInput =
    getElement(
        "country"
    );

const phoneInput =
    getElement(
        "phone"
    );

const saveProfileButton =
    getElement(
        "saveProfileButton"
    );

const profileMessage =
    getElement(
        "profileMessage"
    );


/* Password */

const passwordForm =
    getElement(
        "passwordForm"
    );

const newPasswordInput =
    getElement(
        "newPassword"
    );

const confirmPasswordInput =
    getElement(
        "confirmPassword"
    );

const savePasswordButton =
    getElement(
        "savePasswordButton"
    );

const passwordMessage =
    getElement(
        "passwordMessage"
    );


/* Logout */

const logoutButton =
    getElement(
        "logoutButton"
    );


/* =========================================
   MESSAGE HELPERS
========================================= */

function showProfileMessage(
    message,
    type = "error"
) {

    if (!profileMessage) return;

    profileMessage.textContent =
        message;

    profileMessage.className =
        `settings-message ${type}`;

    profileMessage.hidden =
        false;

}


function hideProfileMessage() {

    if (!profileMessage) return;

    profileMessage.hidden =
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
   DISPLAY USER INFORMATION
========================================= */

function displayUserInformation(
    userData,
    user
) {

    /*
     * Full Name
     */

    const fullName =
        userData.fullName ||
        user.displayName ||
        "";


    /*
     * Username
     */

    const username =
        userData.username ||
        "";


    /*
     * Email
     */

    const email =
        userData.email ||
        user.email ||
        "";


    /*
     * Country
     */

    const country =
        userData.country ||
        "";


    /*
     * Phone
     */

    const phone =
        userData.phone ||
        "";


    /* =====================================
       FULL NAME
    ===================================== */

    setElementValue(
        fullNameInput,
        fullName
    );


    /* =====================================
       USERNAME
    ===================================== */

    setElementValue(
        usernameInput,
        username
    );


    if (
        usernameInput &&
        "readOnly" in usernameInput
    ) {

        usernameInput.readOnly =
            true;

    }


    /* =====================================
       EMAIL
    ===================================== */

    setElementValue(
        emailInput,
        email
    );


    if (
        emailInput &&
        "readOnly" in emailInput
    ) {

        emailInput.readOnly =
            true;

    }


    /* =====================================
       COUNTRY
    ===================================== */

    setElementValue(
        countryInput,
        country
    );


    if (
        countryInput &&
        "readOnly" in countryInput
    ) {

        countryInput.readOnly =
            true;

    }


    /* =====================================
       PHONE
    ===================================== */

    setElementValue(
        phoneInput,
        phone
    );


    if (
        phoneInput &&
        "readOnly" in phoneInput
    ) {

        phoneInput.readOnly =
            true;

    }

}


/* =========================================
   LOAD USER DATA
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
            await getDoc(
                userRef
            );


        if (
            !userSnapshot.exists()
        ) {

            showProfileMessage(
                "Your account information could not be found."
            );

            return;

        }


        const userData =
            userSnapshot.data();


        displayUserInformation(
            userData,
            user
        );


    } catch (error) {

        console.error(
            "Load settings error:",
            error
        );


        showProfileMessage(
            "Unable to load your account information."
        );

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
   SAVE FULL NAME
========================================= */

if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            hideProfileMessage();


            if (!currentUser) {

                showProfileMessage(
                    "Please log in again."
                );

                return;

            }


            const fullName =
                fullNameInput?.value
                    ?.trim() ||
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (!fullName) {

                showProfileMessage(
                    "Please enter your full name."
                );

                fullNameInput?.focus();

                return;

            }


            if (
                fullName.length < 2
            ) {

                showProfileMessage(
                    "Your full name must contain at least 2 characters."
                );

                fullNameInput?.focus();

                return;

            }


            /* =================================
               LOADING
            ================================= */

            saveProfileButton.disabled =
                true;

            const originalText =
                saveProfileButton.textContent;

            saveProfileButton.textContent =
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


                showProfileMessage(
                    "Your full name has been updated successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                showProfileMessage(
                    "Unable to update your full name. Please try again."
                );


            } finally {

                saveProfileButton.disabled =
                    false;

                saveProfileButton.textContent =
                    originalText ||
                    "Save Changes";

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
        async function (event) {

            event.preventDefault();


            hidePasswordMessage();


            if (!currentUser) {

                showPasswordMessage(
                    "Please log in again."
                );

                return;

            }


            const newPassword =
                newPasswordInput?.value ||
                "";


            const confirmPassword =
                confirmPasswordInput?.value ||
                "";


            /* =================================
               VALIDATION
            ================================= */

            if (!newPassword) {

                showPasswordMessage(
                    "Please enter your new password."
                );

                newPasswordInput?.focus();

                return;

            }


            if (
                newPassword.length < 6
            ) {

                showPasswordMessage(
                    "Password must contain at least 6 characters."
                );

                newPasswordInput?.focus();

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                showPasswordMessage(
                    "Passwords do not match."
                );

                confirmPasswordInput?.focus();

                return;

            }


            /* =================================
               LOADING
            ================================= */

            savePasswordButton.disabled =
                true;

            const originalText =
                savePasswordButton.textContent;

            savePasswordButton.textContent =
                "Updating...";


            try {

                await updatePassword(
                    currentUser,
                    newPassword
                );


                showPasswordMessage(
                    "Your password has been updated successfully.",
                    "success"
                );


                /*
                 * Clear password fields.
                 */

                if (newPasswordInput) {

                    newPasswordInput.value =
                        "";

                }


                if (confirmPasswordInput) {

                    confirmPasswordInput.value =
                        "";

                }


                /*
                 * Hide success message.
                 */

                setTimeout(
                    () => {

                        hidePasswordMessage();

                    },
                    3000
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


                    case "auth/user-token-expired":

                        message =
                            "Your session has expired. Please log in again.";

                        break;


                    default:

                        /*
                         * Don't expose unnecessary
                         * Firebase internal errors.
                         */

                        if (
                            error.message &&
                            error.code ===
                            "auth/invalid-credential"
                        ) {

                            message =
                                "Your current session is no longer valid. Please log in again.";

                        }

                        break;

                }


                showPasswordMessage(
                    message
                );


            } finally {

                savePasswordButton.disabled =
                    false;

                savePasswordButton.textContent =
                    originalText ||
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
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            logoutButton.disabled =
                true;


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

            }

        }
    );

}
