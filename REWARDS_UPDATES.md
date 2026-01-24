# Rewards Management Updates

I have implemented the new Consent Tracking visibility and filtering, along with additional payout details.

## 1. Reward Details Page
- **Consent Tracking Section**: Added a comprehensive read-only section displaying:
  - Video/Testimonial Consent (Yes/No)
  - Captured At (Timestamp)
  - Source (e.g., Reward Claim Flow)
- **Payout Information**: Creating a new section displaying:
  - Payout Method (USDT, Gift Card, etc.)
  - Gateway (e.g., Fireblocks)
  - Wallet Address (for USDT)
  - Payment Status
- **Reward Month**: Added to the main details card.

## 2. Rewards Management List
- **Consent Filter**: Added a new filter dropdown to the top bar.
  - Options: All, Yes (Opted In), No (Opted Out)
  - Works in conjunction with existing Status, Month, and Rank filters.
- **Mock Data**: Updated mock data to include sample wallet addresses and consent sources for testing.

## Files Modified
- `src/pages/RewardDetailsPage.js`
- `src/pages/RewardsPage.js`
- `src/services/mockDataService.js`

## Verification
1. Go to **Rewards**.
2. Use the new **Consent** filter (Green video icon) to specific users who opted in.
3. Click on a reward row.
4. Verify the **Payout Information** card shows Wallet/Gateway.
5. Verify the **Consent Tracking** card shows clear Yes/No status and Source.
