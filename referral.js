/* =========================================
   GlobalEarn Referral
   referral.js

   Referral system:
   Username-based referral links
   Example:
   register.html?ref=john123

   Reward:
   $3.50 per successful referral
   Maximum referral goal: 10
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
        count *
        REFERRAL_REWARD;


    const percentage =
        Math.min(
            (count / REFERRAL_GOAL) * 100,
            100
        );


    if (referralCount) {

        /*
         * HTML currently displays /10
         * separately, so only display count.
         */

        referralCount.textContent =
            count;

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
            `${count}/${REFERRAL_GOAL}`;

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

            <div class="empty-icon">

                <i class="fa-solid fa-users"></i>

            </div>

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
   CREATE REFERRAL ELEMENT
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
    username
) {

    try {

        if (!username) {

            updateProgress(0);

            showEmptyReferrals();

            return;

        }


        /*
         * Find users whose referredBy field
         * equals this user's username.
         */

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
                    username
                )
            );


        const snapshot =
            await getDocs(
                referralQuery
            );


        const referrals = [];


        snapshot.forEach(
            documentSnapshot => {

                /*
                 * Prevent counting the current
                 * account as its own referral.
                 */

                if (
                    documentSnapshot.id !==
                    user.uid
                ) {

                    referrals.push(
                        documentSnapshot.data()
                    );

                }

            }
        );


        /*
         * Newest referrals first.
         */

        referrals.sort(
            (a, b) => {

                const dateA =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const dateB =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return dateB - dateA;

            }
        );


        /*
         * Maximum display is 10.
         */

        const displayedReferrals =
            referrals.slice(
                0,
                REFERRAL_GOAL
            );


        updateProgress(
            displayedReferrals.length
        );


        if (
            displayedReferrals.length === 0
        ) {

            showEmptyReferrals();

            return;

        }


        if (!referralList) return;


        referralList.innerHTML = "";


        displayedReferrals.forEach(
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
   LOAD USER REFERRAL DATA
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
         * USERNAME IS THE REFERRAL IDENTIFIER
         */

        const username =
            String(
                data.username ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!username) {

            showError(
                "Username is not available."
            );

            if (referralLink) {

                referralLink.value =
                    "Username unavailable";

            }

            return;

        }


        /*
         * Display username as referral code
         * if the HTML contains this element.
         */

        if (myReferralCode) {

            myReferralCode.textContent =
                username;

        }


        /*
         * Build register URL.
         *
         * Example:
         *
         * register.html?ref=john123
         */

        const registerURL =
            new URL(
                "register.html",
                window.location.href
            );


        registerURL.searchParams.set(
            "ref",
            username
        );


        const referralURL =
            registerURL.href;


        /*
         * Display referral link.
         */

        if (referralLink) {

            referralLink.value =
                referralURL;

        }


        /*
         * Load users who registered
         * using this username.
         */

        await loadReferrals(
            user,
            username
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


        const link =
            referralLink.value;


        if (
            !link ||
            link === "Loading..."
        ) {

            return;

        }


        try {

            await navigator.clipboard.writeText(
                link
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
             * Clipboard fallback.
             */

            try {

                referralLink.focus();

                referralLink.select();

                referralLink.setSelectionRange(
                    0,
                    referralLink.value.length
                );

                document.execCommand(
                    "copy"
                );

            } catch (fallbackError) {

                console.error(
                    "Fallback copy failed:",
                    fallbackError
                );

            }

        }

    }
);


/* =========================================
   COPY USERNAME
========================================= */

copyCodeButton?.addEventListener(
    "click",
    async () => {

        if (!myReferralCode) return;


        const username =
            myReferralCode.textContent
                .trim();


        if (!username) return;


        try {

            await navigator.clipboard.writeText(
                username
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
                "Username copy failed:",
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
