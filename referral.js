/* =========================================
   GlobalEarn Referral
   referral.js

   Username Referral System

   Flow:
   1. User shares referral link
   2. New user registers
   3. Referral appears as PENDING
   4. Referrer clicks "Accept $3.50"
   5. $3.50 is added to the referrer's balance
   6. Referral becomes ACCEPTED

   Reward:
   $3.50 per accepted referral

   Maximum:
   10 accepted referrals
   Maximum earnings: $35.00
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
    getDocs,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


/* =========================================
   SETTINGS
========================================= */

const REFERRAL_REWARD = 3.50;

const REFERRAL_LIMIT = 10;


/* =========================================
   ELEMENTS
========================================= */

const referralCount =
    document.getElementById("referralCount");

const referralEarnings =
    document.getElementById("referralEarnings");

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

const referralList =
    document.getElementById("referralList");


/* =========================================
   CURRENT USER
========================================= */

let currentUser = null;


/* =========================================
   MONEY FORMAT
========================================= */

function formatMoney(value) {

    return `$${Number(value || 0).toFixed(2)}`;

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "Date unavailable";
    }

    try {

        const date =
            typeof timestamp.toDate === "function"
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );

    } catch (error) {

        console.error(
            "Date formatting error:",
            error
        );

        return "Date unavailable";

    }

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
   UPDATE PROGRESS
========================================= */

function updateProgress(
    count,
    earnings
) {

    const acceptedCount =
        Math.min(
            Number(count) || 0,
            REFERRAL_LIMIT
        );

    const acceptedEarnings =
        Number(earnings) || 0;

    const percentage =
        Math.min(
            (acceptedCount / REFERRAL_LIMIT) * 100,
            100
        );


    if (referralCount) {

        referralCount.textContent =
            acceptedCount;

    }


    if (referralEarnings) {

        referralEarnings.textContent =
            formatMoney(
                acceptedEarnings
            );

    }


    if (progressText) {

        progressText.textContent =
            `${acceptedCount}/${REFERRAL_LIMIT}`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;

    }

}


/* =========================================
   EMPTY REFERRALS
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
   SHOW ERROR
========================================= */

function showReferralError(message) {

    console.error(
        "Referral error:",
        message
    );

}


/* =========================================
   CREATE REFERRAL CARD
========================================= */

function createReferralElement(
    referral
) {

    const item =
        document.createElement("div");


    item.className =
        "referral-user";


    const fullName =
        referral.fullName ||
        referral.name ||
        "GlobalEarn Member";


    const username =
        referral.username ||
        "username";


    const createdAt =
        formatDate(
            referral.createdAt
        );


    const status =
        referral.referralStatus ||
        "pending";


    const isAccepted =
        status === "accepted";


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
                • Joined ${escapeHTML(createdAt)}
            </span>

        </div>


        <div class="referral-user-action">

            ${
                isAccepted

                ? `

                    <div class="referral-accepted">

                        <i class="fa-solid fa-circle-check"></i>

                        Accepted

                    </div>

                `

                : `

                    <button
                        type="button"
                        class="accept-referral-button"
                        data-user-id="${escapeHTML(referral.uid)}"
                    >

                        <i class="fa-solid fa-check"></i>

                        Accept $3.50

                    </button>

                `

            }

        </div>

    `;


    return item;

}


/* =========================================
   LOAD CURRENT USER
========================================= */

async function getCurrentUserData() {

    const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (!snapshot.exists()) {

        throw new Error(
            "Your user account could not be found."
        );

    }


    return snapshot.data();

}


/* =========================================
   LOAD REFERRALS
========================================= */

async function loadReferrals(
    username
) {

    try {

        if (!username) {

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

                if (
                    documentSnapshot.id !==
                    currentUser.uid
                ) {

                    referrals.push({

                        uid:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    });

                }

            }
        );


        /* =========================================
           SORT NEWEST FIRST
        ========================================= */

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


        if (
            referrals.length === 0
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


        /* =========================================
           ACCEPT BUTTONS
        ========================================= */

        document
            .querySelectorAll(
                ".accept-referral-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async function () {

                            const referredUserId =
                                this.dataset.userId;


                            await acceptReferral(
                                referredUserId,
                                this
                            );

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            "Unable to load referrals:",
            error
        );


        showEmptyReferrals();

    }

}


/* =========================================
   ACCEPT REFERRAL
========================================= */

async function acceptReferral(
    referredUserId,
    button
) {

    if (!currentUser) {
        return;
    }


    if (!referredUserId) {

        alert(
            "Invalid referral."
        );

        return;

    }


    /* =========================================
       CONFIRM
    ========================================= */

    const confirmed =
        window.confirm(
            "Accept this referral and add $3.50 to your balance?"
        );


    if (!confirmed) {

        return;

    }


    /* =========================================
       LOADING
    ========================================= */

    const originalButtonHTML =
        button.innerHTML;


    button.disabled =
        true;


    button.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Processing...

    `;


    try {

        const referrerRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const referredUserRef =
            doc(
                db,
                "users",
                referredUserId
            );


        const referralRecordRef =
            doc(
                db,
                "referrals",
                `${currentUser.uid}_${referredUserId}`
            );


        await runTransaction(
            db,
            async transaction => {

                /* =========================================
                   GET DOCUMENTS
                ========================================= */

                const referrerSnapshot =
                    await transaction.get(
                        referrerRef
                    );


                const referredUserSnapshot =
                    await transaction.get(
                        referredUserRef
                    );


                const referralRecordSnapshot =
                    await transaction.get(
                        referralRecordRef
                    );


                if (
                    !referrerSnapshot.exists()
                ) {

                    throw new Error(
                        "Your account could not be found."
                    );

                }


                if (
                    !referredUserSnapshot.exists()
                ) {

                    throw new Error(
                        "The referred account could not be found."
                    );

                }


                /* =========================================
                   REFERRER DATA
                ========================================= */

                const referrer =
                    referrerSnapshot.data();


                /* =========================================
                   REFERRED USER DATA
                ========================================= */

                const referredUser =
                    referredUserSnapshot.data();


                /* =========================================
                   VERIFY REFERRER
                ========================================= */

                const referredBy =
                    String(
                        referredUser.referredBy ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const referrerUsername =
                    String(
                        referrer.username ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    !referredBy ||
                    referredBy !==
                    referrerUsername
                ) {

                    throw new Error(
                        "This user is not linked to your referral account."
                    );

                }


                /* =========================================
                   CHECK IF ALREADY ACCEPTED
                ========================================= */

                if (
                    referredUser.referralStatus ===
                    "accepted"
                ) {

                    throw new Error(
                        "This referral has already been accepted."
                    );

                }


                if (
                    referralRecordSnapshot.exists()
                ) {

                    const referralRecord =
                        referralRecordSnapshot.data();


                    if (
                        referralRecord.status ===
                        "accepted"
                    ) {

                        throw new Error(
                            "This referral has already been accepted."
                        );

                    }

                }


                /* =========================================
                   REFERRAL COUNT
                ========================================= */

                const currentReferralCount =
                    Number(
                        referrer.referralCount ||
                        0
                    );


                if (
                    currentReferralCount >=
                    REFERRAL_LIMIT
                ) {

                    throw new Error(
                        "You have already reached your 10-referral limit."
                    );

                }


                /* =========================================
                   CURRENT BALANCE
                ========================================= */

                const currentBalance =
                    Number(
                        referrer.balance ||
                        0
                    );


                /* =========================================
                   CURRENT REFERRAL EARNINGS
                ========================================= */

                const currentReferralEarnings =
                    Number(
                        referrer.referralEarnings ||
                        0
                    );


                /* =========================================
                   NEW VALUES
                ========================================= */

                const newBalance =
                    currentBalance +
                    REFERRAL_REWARD;


                const newReferralEarnings =
                    currentReferralEarnings +
                    REFERRAL_REWARD;


                const newReferralCount =
                    currentReferralCount +
                    1;


                /* =========================================
                   UPDATE REFERRER
                ========================================= */

                transaction.update(
                    referrerRef,
                    {

                        balance:
                            newBalance,

                        referralEarnings:
                            newReferralEarnings,

                        referralCount:
                            newReferralCount,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                /* =========================================
                   UPDATE REFERRED USER
                ========================================= */

                transaction.update(
                    referredUserRef,
                    {

                        referralStatus:
                            "accepted",

                        referralAcceptedAt:
                            serverTimestamp(),

                        referralAcceptedBy:
                            currentUser.uid

                    }
                );


                /* =========================================
                   CREATE / UPDATE REFERRAL RECORD
                ========================================= */

                transaction.set(
                    referralRecordRef,
                    {

                        referrerId:
                            currentUser.uid,

                        referrerUsername:
                            referrerUsername,

                        referredUserId:
                            referredUserId,

                        referredUsername:
                            referredUser.username ||
                            "",

                        reward:
                            REFERRAL_REWARD,

                        status:
                            "accepted",

                        acceptedAt:
                            serverTimestamp(),

                        createdAt:
                            referralRecordSnapshot.exists()

                                ? referralRecordSnapshot
                                    .data()
                                    .createdAt ||
                                    serverTimestamp()

                                : serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );

            }
        );


        /* =========================================
           SUCCESS
        ========================================= */

        alert(
            "Referral accepted! $3.50 has been added to your balance."
        );


        /*
         * Reload referral information.
         */

        await initializeReferralPage();


    } catch (error) {

        console.error(
            "Accept referral error:",
            error
        );


        alert(
            error.message ||
            "Unable to accept this referral."
        );


        button.disabled =
            false;


        button.innerHTML =
            originalButtonHTML;

    }

}


/* =========================================
   LOAD REFERRAL PAGE
========================================= */

async function initializeReferralPage() {

    try {

        const userData =
            await getCurrentUserData();


        const username =
            String(
                userData.username ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!username) {

            showReferralError(
                "Username is not available."
            );

            return;

        }


        /* =========================================
           REFERRAL LINK
        ========================================= */

        const registerURL =
            new URL(
                "register.html",
                window.location.href
            );


        registerURL.searchParams.set(
            "ref",
            username
        );


        if (referralLink) {

            referralLink.value =
                registerURL.href;

        }


        /* =========================================
           EXISTING EARNINGS
        ========================================= */

        updateProgress(
            Number(
                userData.referralCount ||
                0
            ),
            Number(
                userData.referralEarnings ||
                0
            )
        );


        /* =========================================
           LOAD REFERRALS
        ========================================= */

        await loadReferrals(
            username
        );


    } catch (error) {

        console.error(
            "Referral page initialization error:",
            error
        );

        showReferralError(
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

        if (!referralLink) {
            return;
        }


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
                "Copy referral link error:",
                error
            );


            try {

                referralLink.focus();

                referralLink.select();

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


        currentUser =
            user;


        await initializeReferralPage();

    }
);
