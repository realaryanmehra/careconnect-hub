# Future Telemedicine Enhancements

This document outlines the planned future features and testing steps for the CareConnect Hub Telemedicine module.

## 1. Testing the Current Video Call Feature
Before adding new features, we need to test the existing implementation:
- [ ] Open two browser windows (Patient and Admin).
- [ ] As Patient: Generate a new token in the Token Management page.
- [ ] As Admin: Go to Admin Dashboard -> Queue Tokens tab.
- [ ] As Admin: Change the token status from "Waiting" to "In Progress".
- [ ] Both: Click the newly appeared "Join Video Call" button.
- [ ] Verify that audio, video, and the mute/camera toggles work properly over WebRTC.

## 2. Planned Future Features
Once the core WebRTC video call is verified, we will implement the following:

- **Virtual Waiting Room UI Enhancements:** Improve the lobby experience while the patient waits for the admin/doctor to admit them.
- **In-Call Text Chat:** Add a text chat box alongside the video feed using Socket.io to allow sharing of links or text if audio fails.
- **Secure File Sharing:** Allow patients to upload PDF lab reports/X-rays during the call, and allow doctors to send digital prescriptions.
- **Screen Sharing:** Integrate the `getDisplayMedia()` API so doctors can share their screens to explain MRI scans or test results.
- **Automated E-Prescriptions:** Generate a downloadable PDF prescription automatically when the call ends, and send it to the patient's email via Nodemailer.
- **Payment Gateway Integration:** Require patients to pay a consultation fee (via Stripe/Razorpay) before the "Join Call" button unlocks.
