# Payment Logic Fixes TODO

## Backend Fixes (payment.js)
- [x] Fix `/verify-manual-payment` endpoint to accept and validate `credits` parameter
- [x] Update credit addition logic to use selected package credits instead of defaulting to 100
- [x] Add validation against CREDIT_PACKAGES mapping
- [x] Improve error handling and logging for manual verification
- [x] Add server-side validation for credit amounts

## Frontend Fixes (Payment.jsx)
- [x] Update `verifyManualPayment` function to pass `selectedPackage.credits` to API
- [x] Ensure credits parameter is correctly sent in verification request
- [x] Add better error handling for verification failures

## Testing & Validation
- [x] Backend server started successfully (no syntax errors)
- [ ] Test credit card payment flow after fixes
- [ ] Test UPI payment and verification flow
- [ ] Verify credit packages consistency between frontend and backend
- [ ] Test edge cases (invalid credits, missing parameters)

## Additional Improvements
- [ ] Consider adding email notifications for payment confirmations
- [ ] Review Razorpay configuration if credit card errors persist
- [ ] Add payment status tracking improvements
