# Account Page Mobile UX Redesign

The current account page uses a desktop-first approach (sidebar + content). On mobile, this forces the sidebar to be a horizontal scrolling list, which feels cluttered and non-native.

To provide a truly premium, app-like experience for mobile users, we need to shift to a **Native App Hub** architecture.

## Proposed UX/UI Architecture (App-Like Experience)

### 1. Mobile Experience (The "Hub")
On mobile, the root `/account` page will act as the "Hub" (just like in the Zara or Myntra app).
- The horizontal scrolling sidebar will be **completely removed** on mobile.
- Instead, the `/account` dashboard will display:
  1. A sleek profile header greeting the user.
  2. Quick stat cards (Orders, Wishlist).
  3. A full-width vertical list of navigation links (Orders, Addresses, Profile, etc.) with large, touch-friendly tap targets and a `>` chevron.
- When a user taps "Orders", they navigate to `/account/orders`. The navigation list disappears, giving the full screen to the Orders page.
- Every child page (Orders, Addresses, etc.) will have a sticky `< Back to Account` button at the top on mobile.

### 2. Desktop Experience
The desktop experience will remain a classic Sidebar layout:
- Left side: Sticky vertical sidebar.
- Right side: Content area (Dashboard, Orders, Addresses, etc.).

## Proposed Changes

### [MODIFY] `app/(storefront)/account/(main)/layout.tsx`
- Hide the `Sidebar` component entirely on mobile using `hidden lg:block`.
- This ensures child pages (like `/account/orders`) take up the full screen on mobile without the sidebar cluttering the top.

### [MODIFY] `app/(storefront)/account/(main)/page.tsx`
- Build the "Mobile Navigation Hub" directly into this page.
- On desktop, this page will just show the dashboard stats (Total Orders, Wishlist, Recent Orders).
- On mobile, this page will show the stats PLUS the vertical list of all account links (Profile, Addresses, Appointments, Wishlist) acting as the primary navigation.

### [NEW] `components/account/MobileBackNav.tsx`
- A new component that renders a sleek `< Back to My Account` button.
- It will be hidden on desktop (`lg:hidden`).
- We will drop this component at the top of all child pages:
  - `orders/page.tsx`
  - `addresses/page.tsx`
  - `profile/page.tsx`
  - `wishlist/page.tsx`
  - `appointments/page.tsx`

## User Review Required
> [!IMPORTANT]
> Is this "App-Like" approach what you have in mind for mobile users? It will completely remove the horizontal scrolling menu on mobile and replace it with a clean, full-screen menu on the main account page. Let me know if you approve this plan or if you have specific apps (like Zara, Farfetch) in mind for inspiration!
