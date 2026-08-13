/* =========================================
   GlobalEarn Referral
   referral.js

   Referral System

   Flow:
   1. User shares referral link
   2. New user registers
   3. Referral appears as Pending
   4. Referrer clicks Accept $3.50
   5. $3.50 is added to balance
   6. Referral becomes Accepted

   Maximum:
   10 accepted referrals
========================================= */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

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

const REFERRAL_GOAL = 10;


/* =========================================
   ELEMENTS
========================================= */

const referralCount =
    document.getElementById(
        "referralCount"
    );

const referralEarnings =
    document.getElementById(
        "referralEarnings"
    );

const referralsRemaining =
    document.getElementById(
        "referralsRemaining"
    );

const progressText =
    document.getElementById(
        "progressText"
    );

const progressFill =
    document.getElementById(
        "progressFill"
    );

const referralLink =
    document.getElementById(
        "referralLink"
    );

const copyReferralButton =
    document.getElementById(
        "copyReferralButton"
    );

const copyMessage =
    document.getElementById(
        "copyMessage"
    );

const myReferralCode =
    document.getElementById(
        "myReferralCode"
    );

const copyCodeButton =
    document.getElementById(
        "copyCodeButton"
    );

const referralList =
    document.getElementById(
        "referralList"
    );


/* =========================================
   CURRENT USER
========================================= */

let currentUser = null;


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
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   UPDATE PROGRESS
========================================= */

function updateProgress(
    count,
    earnings
) {

    const safeCount =
        Math.min(
            Number(count) || 0,
            REFERRAL_GOAL
        );


    const safeEarnings =
        Number(earnings) || 0;


    const remaining =
        Math.max(
            REFERRAL_GOAL -
            safeCount,
            0
        );


    const percentage =
        Math.min(
            (
                safeCount /
                REFERRAL_GOAL
            ) * 100,
            100
        );


    if (referralCount) {

        referralCount.textContent =
            safeCount;

    }


    if (referralEarnings) {

        referralEarnings.textContent =
            `$${safeEarnings.toFixed(2)}`;

    }


    if (referralsRemaining) {

        referralsRemaining.textContent =
            remaining;

    }


    if (progressText) {

        progressText.textContent =
            `${safeCount}/${REFERRAL_GOAL}`;

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
   ACCEPT REFERRAL
========================================= */

async function acceptReferral(
    referralUserId,
    button
) {

    if (!currentUser) {

        return;

    }


    if (!referralUserId) {

        return;

    }


    try {

        button.disabled =
            true;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Processing...

        `;


        await runTransaction(
            db,
            async transaction => {

                /* =====================================
                   REFERRER
                ===================================== */

                const referrerRef =
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    );


                /* =====================================
                   REFERRAL USER
                ===================================== */

                const referralUserRef =
                    doc(
                        db,
                        "users",
                        referralUserId
                    );


                /* =====================================
                   REFERRAL RECORD
                ===================================== */

                const referralRecordRef =
                    doc(
                        db,
                        "referrals",
                        referralUserId
                    );


                const referrerSnapshot =
                    await transaction.get(
                        referrerRef
                    );


                const referralUserSnapshot =
                    await transaction.get(
                        referralUserRef
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
                    !referralUserSnapshot.exists()
                ) {

                    throw new Error(
                        "Referral user could not be found."
                    );

                }


                /* =====================================
                   GET DATA
                ===================================== */

                const referrer =
                    referrerSnapshot.data();


                const referralUser =
                    referralUserSnapshot.data();


                const referralRecord =
                    referralRecordSnapshot.exists()
                        ? referralRecordSnapshot.data()
                        : null;


                /* =====================================
                   VERIFY REFERRAL
                ===================================== */

                const referredBy =
                    String(
                        referralUser.referredBy ||
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
                    referredBy !==
                    referrerUsername
                ) {

                    throw new Error(
                        "This user was not referred by you."
                    );

                }


                /* =====================================
                   CHECK IF ALREADY ACCEPTED
                ===================================== */

                if (
                    referralRecord &&
                    referralRecord.status ===
                    "accepted"
                ) {

                    throw new Error(
                        "This referral has already been accepted."
                    );

                }


                /* =====================================
                   REFERRAL LIMIT
                ===================================== */

                const currentCount =
                    Number(
                        referrer.referralCount ||
                        0
                    );


                if (
                    currentCount >=
                    REFERRAL_GOAL
                ) {

                    throw new Error(
                        "You have already reached the maximum of 10 accepted referrals."
                    );

                }


                /* =====================================
                   CURRENT BALANCE
                ===================================== */

                const currentBalance =
                    Number(
                        referrer.balance ||
                        0
                    );


                /* =====================================
                   CURRENT REFERRAL EARNINGS
                ===================================== */

                const currentReferralEarnings =
                    Number(
                        referrer.referralEarnings ||
                        0
                    );


                /* =====================================
                   NEW VALUES
                ===================================== */

                const newBalance =
                    currentBalance +
                    REFERRAL_REWARD;


                const newReferralEarnings =
                    currentReferralEarnings +
                    REFERRAL_REWARD;


                const newReferralCount =
                    currentCount + 1;


                /* =====================================
                   UPDATE REFERRER
                ===================================== */

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


                /* =====================================
                   CREATE / UPDATE REFERRAL RECORD
                ===================================== */

                transaction.set(
                    referralRecordRef,
                    {

                        referralId:
                            referralUserId,

                        referrerId:
                            currentUser.uid,

                        referrerUsername:
                            referrerUsername,

                        referredUsername:
                            referralUser.username ||
                            "username",

                        reward:
                            REFERRAL_REWARD,

                        status:
                            "accepted",

                        acceptedAt:
                            serverTimestamp(),

                        createdAt:
                            referralRecord?.createdAt ||
                            serverTimestamp()

                    }
                );

            }
        );


        /* =========================================
           SUCCESS
        ========================================= */

        button.innerHTML = `

            <i class="fa-solid fa-check"></i>

            Accepted +$3.50

        `;


        button.classList.add(
            "accepted"
        );


        /*
         * Reload referral data so
         * balance/referral numbers update.
         */

        await loadReferralData(
            currentUser
        );


    } catch (error) {

        console.error(
            "Accept referral error:",
            error
        );


        alert(
            error.message ||
            "Unable to accept referral."
        );


        button.disabled =
            false;


        button.innerHTML = `

            <i class="fa-solid fa-check"></i>

            Accept $3.50

        `;

    }

}


/* =========================================
   CREATE REFERRAL ELEMENT
========================================= */

function createReferralElement(
    data,
    referralUserId
) {

    const item =
        document.createElement(
            "div"
        );


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


    /*
     * Existing referral record status
     * is supplied separately.
     */

    const status =
        data.referralStatus ||
        "pending";


    const isAccepted =
        status ===
        "accepted";


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


        <div class="referral-user-action">

            ${
                isAccepted

                ?

                `
                    <span class="referral-status accepted">
                        <i class="fa-solid fa-circle-check"></i>
                        Accepted
                    </span>
                `

                :

                `
                    <button
                        type="button"
                        class="accept-referral-button"
                        data-user-id="${escapeHTML(referralUserId)}"
                    >

                        <i class="fa-solid fa-check"></i>

                        Accept $3.50

                    </button>
                `

            }

        </div>

    `;


    /*
     * Accept button
     */

    const button =
        item.querySelector(
            ".accept-referral-button"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                acceptReferral(
                    referralUserId,
                    button
                );

            }
        );

    }


    return item;

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

            updateProgress(
                0,
                0
            );

            showEmptyReferrals();

            return;

        }


        /* =====================================
           FIND USERS REFERRED BY USERNAME
        ===================================== */

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


        /* =====================================
           GET REFERRAL RECORDS
        ===================================== */

        for (
            const documentSnapshot
            of snapshot.docs
        ) {

            /*
             * Don't count current account.
             */

            if (
                documentSnapshot.id ===
                user.uid
            ) {

                continue;

            }


            const referralUser =
                documentSnapshot.data();


            const referralRecordRef =
                doc(
                    db,
                    "referrals",
                    documentSnapshot.id
                );


            const referralRecordSnapshot =
                await getDoc(
                    referralRecordRef
                );


            let referralStatus =
                "pending";


            if (
                referralRecordSnapshot.exists()
            ) {

                const record =
                    referralRecordSnapshot.data();


                if (
                    record.status ===
                    "accepted"
                ) {

                    referralStatus =
                        "accepted";

                }

            }


            referrals.push({

                ...referralUser,

                referralStatus:

                    referralStatus,

                referralUserId:
                    documentSnapshot.id

            });

        }


        /* =====================================
           SORT NEWEST FIRST
        ===================================== */

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


        /* =====================================
           ACCEPTED REFERRALS
        ===================================== */

        const acceptedReferrals =
            referrals.filter(
                referral =>
                    referral.referralStatus ===
                    "accepted"
            );


        const acceptedCount =
            Math.min(
                acceptedReferrals.length,
                REFERRAL_GOAL
            );


        const acceptedEarnings =
            acceptedCount *
            REFERRAL_REWARD;


        updateProgress(
            acceptedCount,
            acceptedEarnings
        );


        /* =====================================
           EMPTY
        ===================================== */

        if (
            referrals.length ===
            0
        ) {

            showEmptyReferrals();

            return;

        }


        if (!referralList) {
            return;
        }


        referralList.innerHTML =
            "";


        /* =====================================
           DISPLAY REFERRALS
        ===================================== */

        referrals
            .slice(
                0,
                50
            )
            .forEach(
                referral => {

                    const element =
                        createReferralElement(
                            referral,
                            referral.referralUserId
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


        updateProgress(
            0,
            0
        );


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


        if (
            !snapshot.exists()
        ) {

            console.error(
                "User profile was not found."
            );

            return;

        }


        const data =
            snapshot.data();


        const username =
            String(
                data.username ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!username) {

            if (referralLink) {

                referralLink.value =
                    "Username unavailable";

            }

            return;

        }


        /* =====================================
           REFERRAL CODE
        ===================================== */

        if (myReferralCode) {

            myReferralCode.textContent =
                username;

        }


        /* =====================================
           BUILD REFERRAL URL
        ===================================== */

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


        /* =====================================
           IMPORTANT
           Use Firestore values for earnings.
        ===================================== */

        const count =
            Number(
                data.referralCount ||
                0
            );


        const earnings =
            Number(
                data.referralEarnings ||
                0
            );


        updateProgress(
            count,
            earnings
        );


        /* =====================================
           LOAD REFERRALS
        ===================================== */

        await loadReferrals(
            user,
            username
        );


    } catch (error) {

        console.error(
            "Referral data error:",
            error
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
            link ===
            "Loading..."
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


            try {

                referralLink.focus();

                referralLink.select();

                document.execCommand(
                    "copy"
                );

            } catch (
                fallbackError
            ) {

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

        if (!myReferralCode) {
            return;
        }


        const username =
            myReferralCode
                .textContent
                .trim();


        if (!username) {
            return;
        }


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


        currentUser =
            user;


        await loadReferralData(
            user
        );

    }
);


/* =========================================
   PAGE READY
========================================= */

document.documentElement.classList.add(
    "referral-ready"
);
