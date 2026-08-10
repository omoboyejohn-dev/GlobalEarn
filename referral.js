/* =========================================
   GlobalEarn Referral
   referral.js
========================================= */

import {
    auth,
    db
} from "./firebase.js";


/* =========================================
   FIREBASE AUTH
========================================= */

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";


/* =========================================
   FIRESTORE
========================================= */

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   REFERRAL SETTINGS
========================================= */

const REFERRAL_REWARD = 3.50;

const REFERRAL_GOAL = 10;


/* =========================================
   ELEMENTS
========================================= */

const referralCount =
    document.getElementById("referralCount");

const referralEarnings =
    document.getElementById("referralEarnings");

const referralsRemaining =
    document.getElementById("referralsRemaining");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");

const referralLink =
    document.getElementById("referralLink");

const copyReferralButton =
    document.getElementById("copyReferralButton");

const copyMessage =
    document.getElementById("copyMessage");

const myReferralCode =
    document.getElementById("myReferralCode");

const copyCodeButton =
    document.getElementById("copyCodeButton");

const referralList =
    document.getElementById("referralList");


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    console.error(
        "Referral error:",
        message
    );

}


/* =========================================
   GENERATE REFERRAL CODE
========================================= */

function generateReferralCode(user) {

    const uidPart =
        user.uid
            .substring(0, 8)
            .toUpperCase();

    return `GE${uidPart}`;

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(timestamp) {

    if (!timestamp) {

        return "Date unavailable";

    }


    try {

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp
                .toDate()
                .toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                );

        }


        if (
            timestamp instanceof Date
        ) {

            return timestamp
                .toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                );

        }

    } catch (error) {

        console.error(
            "Date formatting error:",
            error
        );

    }


    return "Date unavailable";

}


/* =========================================
   UPDATE PROGRESS
========================================= */

function updateProgress(
    referralTotal
) {

    const count =
        Math.min(
            referralTotal,
            REFERRAL_GOAL
        );


    const remaining =
        Math.max(
            REFERRAL_GOAL - count,
            0
        );


    const earnings =
        referralTotal *
        REFERRAL_REWARD;


    const percentage =
        Math.min(
            (count / REFERRAL_GOAL) * 100,
            100
        );


    if (referralCount) {

        referralCount.textContent =
            `${count} / ${REFERRAL_GOAL}`;

    }


    if (referralEarnings) {

        referralEarnings.textContent =
            `$${earnings.toFixed(2)}`;

    }


    if (referralsRemaining) {

        referralsRemaining.textContent =
            remaining;

    }


    if (progressText) {

        progressText.textContent =
            `${count} / ${REFERRAL_GOAL}`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;

    }

}


/* =========================================
   SHOW EMPTY REFERRALS
========================================= */

function showEmptyReferrals() {

    if (!referralList) return;


    referralList.innerHTML = `

        <div class="empty-referrals">

            <i class="fa-solid fa-user-group"></i>

            <strong>
                No referrals yet
            </strong>

            <p>
                Share your referral link to start earning.
            </p>

        </div>

    `;

}


/* =========================================
   DISPLAY REFERRAL USER
========================================= */

function createReferralElement(
    data
) {

    const item =
        document.createElement("div");


    item.className =
        "referral-user";


    const fullName =
        data.fullName ||
        data.name ||
        "GlobalEarn Member";


    const username =
        data.username ||
        "username";


    const createdAt =
        formatDate(
            data.createdAt
        );


    item.innerHTML = `

        <div class="referral-user-avatar">

            <i class="fa-solid fa-user"></i>

        </div>


        <div class="referral-user-info">

            <strong>
                ${escapeHTML(fullName)}
            </strong>

            <span>
                @${escapeHTML(username)}
                • Joined ${createdAt}
            </span>

        </div>


        <div class="referral-user-earning">

            +$${REFERRAL_REWARD.toFixed(2)}

        </div>

    `;


    return item;

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   LOAD REFERRALS
========================================= */

async function loadReferrals(
    user,
    userData
) {

    try {

        /*
         * Users who registered using
         * this user's referral code.
         */

        const referralCode =
            userData.referralCode;


        if (!referralCode) {

            updateProgress(0);

            showEmptyReferrals();

            return;

        }


        const usersRef =
            collection(
                db,
                "users"
            );


        const referralQuery =
            query(
                usersRef,
                where(
                    "referredBy",
                    "==",
                    referralCode
                )
            );


        const snapshot =
            await getDocs(
                referralQuery
            );


        const referrals =
            [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                /*
                 * Do not count the current
                 * user as their own referral.
                 */

                if (
                    documentSnapshot.id !==
                    user.uid
                ) {

                    referrals.push(
                        data
                    );

                }

            }
        );


        updateProgress(
            referrals.length
        );


        if (
            !referrals.length
        ) {

            showEmptyReferrals();

            return;

        }


        if (!referralList) return;


        referralList.innerHTML = "";


        referrals.forEach(
            referral => {

                const element =
                    createReferralElement(
                        referral
                    );


                referralList.appendChild(
                    element
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load referrals:",
            error
        );


        updateProgress(0);

        showEmptyReferrals();

    }

}


/* =========================================
   LOAD USER PROFILE
========================================= */

async function loadReferralData(
    user
) {

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(
                userRef
            );


        if (!snapshot.exists()) {

            showError(
                "User profile was not found."
            );

            return;

        }


        const data =
            snapshot.data();


        /*
         * Existing referral code
         */

        let referralCode =
            data.myReferralCode ||
            data.referralCode;


        /*
         * If the account does not have
         * a referral code yet, generate
         * one for display.
         */

        if (!referralCode) {

            referralCode =
                generateReferralCode(
                    user
                );

        }


        /*
         * Display referral code
         */

        if (myReferralCode) {

            myReferralCode.textContent =
                referralCode;

        }


        /*
         * Build referral URL
         */

        const baseURL =
            window.location.origin +
            window.location.pathname
                .replace(
                    "referral.html",
                    "register.html"
                );


        const referralURL =
            `${baseURL}?ref=${encodeURIComponent(
                referralCode
            )}`;


        if (referralLink) {

            referralLink.value =
                referralURL;

        }


        /*
         * Load people who used
         * this referral code.
         */

        await loadReferrals(
            user,
            {
                ...data,
                myReferralCode:
                    referralCode
            }
        );


    } catch (error) {

        console.error(
            "Referral data error:",
            error
        );

        showError(
            "Unable to load referral information."
        );

    }

}


/* =========================================
   COPY REFERRAL LINK
========================================= */

copyReferralButton?.addEventListener(
    "click",
    async () => {

        if (!referralLink) return;


        try {

            await navigator.clipboard.writeText(
                referralLink.value
            );


            if (copyMessage) {

                copyMessage.textContent =
                    "Referral link copied successfully.";

                copyMessage.hidden =
                    false;


                setTimeout(
                    () => {

                        copyMessage.hidden =
                            true;

                    },
                    2500
                );

            }


            copyReferralButton.innerHTML = `

                <i class="fa-solid fa-check"></i>

                Copied

            `;


            setTimeout(
                () => {

                    copyReferralButton.innerHTML = `

                        <i class="fa-solid fa-copy"></i>

                        Copy

                    `;

                },
                2000
            );


        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );


            /*
             * Fallback for browsers
             * that block clipboard API.
             */

            referralLink.select();

            referralLink.setSelectionRange(
                0,
                referralLink.value.length
            );

            document.execCommand(
                "copy"
            );

        }

    }
);


/* =========================================
   COPY REFERRAL CODE
========================================= */

copyCodeButton?.addEventListener(
    "click",
    async () => {

        if (!myReferralCode) return;


        const code =
            myReferralCode.textContent.trim();


        if (!code) return;


        try {

            await navigator.clipboard.writeText(
                code
            );


            copyCodeButton.innerHTML =
                '<i class="fa-solid fa-check"></i>';


            setTimeout(
                () => {

                    copyCodeButton.innerHTML =
                        '<i class="fa-solid fa-copy"></i>';

                },
                1800
            );


        } catch (error) {

            console.error(
                "Referral code copy failed:",
                error
            );

        }

    }
);


/* =========================================
   AUTHENTICATION
========================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        await loadReferralData(
            user
        );

    }
);
