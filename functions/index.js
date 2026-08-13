/* =========================================
   GlobalEarn
   Firebase Referral Reward System

   Reward:
   $3.50 per successful referral

   Maximum:
   10 referrals
   $35.00 maximum referral earnings
========================================= */

const {
    onDocumentCreated
} = require("firebase-functions/v2/firestore");

const {
    getFirestore,
    FieldValue
} = require("firebase-admin/firestore");

const {
    initializeApp
} = require("firebase-admin/app");


/* =========================================
   INITIALIZE FIREBASE ADMIN
========================================= */

initializeApp();


/* =========================================
   FIRESTORE
========================================= */

const db = getFirestore();


/* =========================================
   REFERRAL SETTINGS
========================================= */

const REFERRAL_REWARD = 3.50;

const REFERRAL_LIMIT = 10;


/* =========================================
   NEW USER CREATED
========================================= */

exports.processReferral = onDocumentCreated(
    "users/{userId}",
    async (event) => {

        try {

            /* =========================================
               GET NEW USER
            ========================================= */

            const newUserSnapshot =
                event.data;

            if (!newUserSnapshot) {

                console.log(
                    "No new user data found."
                );

                return;

            }


            const newUser =
                newUserSnapshot.data();


            /* =========================================
               GET REFERRER
            ========================================= */

            const referredBy =
                String(
                    newUser.referredBy || ""
                )
                .trim()
                .toLowerCase();


            /*
             * If the new user did not
             * register through a referral,
             * nothing needs to happen.
             */

            if (!referredBy) {

                console.log(
                    "No referral attached to this user."
                );

                return;

            }


            /* =========================================
               PREVENT SELF REFERRAL
            ========================================= */

            const newUsername =
                String(
                    newUser.username || ""
                )
                .trim()
                .toLowerCase();


            if (
                referredBy ===
                newUsername
            ) {

                console.log(
                    "Self-referral rejected."
                );

                return;

            }


            /* =========================================
               FIND REFERRER
            ========================================= */

            const usersRef =
                db.collection(
                    "users"
                );


            const referrerQuery =
                await usersRef
                    .where(
                        "username",
                        "==",
                        referredBy
                    )
                    .limit(1)
                    .get();


            if (
                referrerQuery.empty
            ) {

                console.log(
                    "Referrer not found:",
                    referredBy
                );

                return;

            }


            const referrerDoc =
                referrerQuery.docs[0];


            const referrerId =
                referrerDoc.id;


            /* =========================================
               PREVENT SELF REFERRAL BY UID
            ========================================= */

            if (
                referrerId ===
                event.params.userId
            ) {

                console.log(
                    "Referrer and new user are the same account."
                );

                return;

            }


            /* =========================================
               TRANSACTION
            ========================================= */

            await db.runTransaction(
                async transaction => {

                    const referrerRef =
                        db.collection(
                            "users"
                        )
                        .doc(
                            referrerId
                        );


                    const referralRef =
                        db.collection(
                            "referrals"
                        )
                        .doc(
                            event.params.userId
                        );


                    const referrerSnapshot =
                        await transaction.get(
                            referrerRef
                        );


                    if (
                        !referrerSnapshot.exists
                    ) {

                        throw new Error(
                            "Referrer account does not exist."
                        );

                    }


                    const referrer =
                        referrerSnapshot.data();


                    /* =========================================
                       CURRENT REFERRAL COUNT
                    ========================================= */

                    const currentCount =
                        Number(
                            referrer.referralCount ||
                            0
                        );


                    /* =========================================
                       REFERRAL LIMIT
                    ========================================= */

                    if (
                        currentCount >=
                        REFERRAL_LIMIT
                    ) {

                        console.log(
                            "Referrer has already reached the 10-referral limit."
                        );

                        return;

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
                       CURRENT EARNINGS
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
                        currentCount + 1;


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
                                FieldValue.serverTimestamp()

                        }
                    );


                    /* =========================================
                       CREATE REFERRAL RECORD
                    ========================================= */

                    transaction.set(
                        referralRef,
                        {

                            referralId:
                                event.params.userId,

                            referrerId:
                                referrerId,

                            referrerUsername:
                                referredBy,

                            referredUsername:
                                newUsername,

                            reward:
                                REFERRAL_REWARD,

                            status:
                                "completed",

                            createdAt:
                                FieldValue.serverTimestamp()

                        }
                    );


                    console.log(
                        `Referral completed: ${referredBy} earned $${REFERRAL_REWARD}`
                    );

                }
            );


            console.log(
                "Referral processing completed."
            );


        } catch (error) {

            console.error(
                "Referral processing error:",
                error
            );

        }

    }
);
