# SunCity - Game Specification

## Overview

**Name:** SunCity
**Platform:** Base Wallet Miniapp
**Genre:** Idle/Incremental + Turn-based Hybrid
**Visual Style:** Pixel Art (v1), Isometric/3D (future)
**Timeline:** 4-6 weeks MVP
**Team:** Solo + AI assistance

### Concept

SunCity is a solar farm building game on Base where players build and expand their own towns powered by solar energy. The more solar capacity your town has, the more you earn. A portion of all game revenue funds real-world solar projects through the Solar Foundation.

---

## Core Gameplay

### Town Building
- Each player owns an **individual town**
- Towns contain **buildings** that need power (homes, schools, hospitals, factories)
- Different building types have different power requirements and rewards
- Buildings **upgrade** as you provide more consistent power
- Start with one block of buildings, expand to power the whole town

### Solar Infrastructure
- Build **solar panels** to generate power
- Add **batteries/storage** for efficiency and capacity
- **Progression system:**
  - Linear core upgrades (Panel → Array → Farm → Mega Farm)
  - Branching tech tree for specialization:
    - Efficiency path (more power per panel)
    - Capacity path (more total output)
    - Storage path (batteries, power stability)

### Construction System
- Players can **purchase unlimited solar** (if they have $SOLAR)
- Construction speed limited by **workers**
- **Worker mechanics:**
  - Start with 1 worker
  - Earn or buy additional workers
  - Workers are **permanent** once acquired
  - Workers can be **upgraded** to build faster
- **Construction time:** Real-time hours (small builds = minutes, large upgrades = hours)

### Idle Mechanics
- **Full offline earnings** - farms generate $SOLAR even when app is closed
- **Daily check-in streaks** with milestone bonuses:
  - Day 7: +10% bonus
  - Day 30: +25% bonus
  - Day 100: +50% bonus
- **Daily action limits** tied to worker availability

### Simplified Systems (v1)
- No weather mechanics - consistent, predictable output
- No complex simulations - focus on core loop

---

## Tokenomics

### Token: $SOLAR
- **Type:** ERC-20 on Base
- **Supply Model:** Disinflationary (uncapped, decreasing emissions over time)
- **Launch:** Fair launch (no presale)
- **Initial Liquidity:** Team-funded or Liquidity Bootstrapping Pool (TBD)

### Earning $SOLAR
1. **Passive generation** - solar farms produce tokens over time based on size/efficiency
2. **Achievement bonuses** - tokens awarded for milestones, upgrades, daily tasks
3. **Check-in streak multipliers** - bonus earnings for consecutive daily logins

### Spending $SOLAR
- Purchase solar panels and batteries
- Buy additional workers
- Upgrade workers
- Upgrade buildings
- Other in-game purchases

### In-Game Spending Distribution
| Destination | Percentage |
|-------------|------------|
| **Burned** (permanently removed) | 50% |
| **Rewards Pool** | 25% |
| **Solar Foundation** | 25% |

### Swap Tax (5% on all buys/sells)
| Destination | Percentage | Paid In |
|-------------|------------|---------|
| **Player Rewards** (by ranking) | 2% | ETH |
| **Project Treasury** (dev/ops) | 2% | ETH |
| **Liquidity Pool** (SOLAR/ETH) | 1% | Auto-LP |

### Reward Distribution
- **Frequency:** Daily epochs
- **Ranking factors:**
  - Town development score (solar + buildings powered + upgrades)
  - Total solar capacity
- **Payout:** ETH distributed proportionally based on ranking

---

## Real-World Impact

### Solar Foundation Integration
- The Solar Foundation (co-founded by project creator) receives 25% of all in-game spending
- Funds support real-world solar installations globally

### Impact Transparency

**Version 1:**
- Basic dashboard showing:
  - Total funds raised
  - Number of projects funded
  - Key statistics

**Future Versions:**
- Project feed with photos/updates from Solar Foundation
- Gamified milestones ("Community funded 10kW installation in Kenya!")
- Impact NFTs for major funding contributions

---

## Social Features

### Version 1
- **Global leaderboard** - all players ranked by town development score
- **Referral system** - one-time $SOLAR bonus for both referrer and new player

### Version 2+
- Friend system (view friends' towns/progress)
- Guilds/collaborative towns
- Competitive territory mechanics
- Seasonal competitions with prizes
- Tiered leagues (Bronze, Silver, Gold, etc.)

---

## Technical Architecture

### Hybrid Approach

**Onchain (Base):**
- $SOLAR token contract
- Player wallet balances
- ETH reward claims
- Swap tax logic
- Major asset ownership (future NFTs)

**Offchain (Backend):**
- Town state, buildings, workers
- Construction timers
- Leaderboard calculations
- Daily epoch snapshots
- Streak tracking
- Game logic

### Recommended Tech Stack
- **Frontend:** Next.js + React
- **Backend:** Vercel serverless functions
- **Database:** PostgreSQL (Supabase or Neon)
- **Blockchain:** viem + wagmi
- **Cron Jobs:** Vercel cron or Upstash (daily epochs)
- **Real-time:** Supabase Realtime (leaderboard updates)
- **DEX:** Aerodrome (external liquidity)

### Smart Contracts

**Approach:** Custom ERC-20 built on OpenZeppelin base

**Admin Functions (Limited):**
- Pause/unpause (emergencies only)
- Update tax recipient addresses
- Exclude addresses from tax (new LP pairs)

**NOT Included:**
- No minting capability (preserves disinflationary model)
- No tax percentage changes
- No wallet blacklisting

**Security:**
- Multisig (Safe) recommended for admin functions
- Open source for community review
- No formal audit for v1 (consider post-launch)

### Network
- **Base only** (no multi-chain)

---

## User Experience

### Onboarding
1. Connect Base Wallet (required)
2. Smart wallet with **gas sponsorship** (no ETH needed to start)
3. Receive **free starter kit:**
   - 1 basic solar panel
   - 1 starter building to power
4. Tutorial introduces core mechanics
5. Progression requires $SOLAR

### Notifications
- **Optional** - players choose their preferences
- Available notifications:
  - Construction complete
  - Daily rewards ready
  - Streak reminders
  - Epoch payouts

### Data & Privacy
- **Wallet address** required (identity)
- **Optional profile** (username, avatar)
- No email collection required
- Minimal data footprint

### Geographic Availability
- Available wherever Base Wallet app is available

---

## Version Roadmap

### Version 1 (MVP) - 4-6 Weeks
- [ ] Individual towns with solar panels + batteries
- [ ] Building types (homes, schools, hospitals, factories)
- [ ] Building upgrades based on power supply
- [ ] Worker-based construction system
- [ ] Worker upgrades
- [ ] Tech tree (efficiency/capacity/storage paths)
- [ ] $SOLAR token deployment (disinflationary, fair launch)
- [ ] 5% swap tax with distribution logic
- [ ] ETH rewards from LP fees (daily epochs)
- [ ] Global leaderboard
- [ ] Referral system (one-time bonus)
- [ ] Check-in streaks with milestone bonuses
- [ ] Full offline earnings
- [ ] Basic impact dashboard
- [ ] Aerodrome liquidity pool integration
- [ ] Base Wallet miniapp integration
- [ ] Pixel art assets (AI-generated + asset packs)

### Version 2
- [ ] Friend system
- [ ] Guild/collaborative town system
- [ ] In-game swap interface
- [ ] Seasonal competitions
- [ ] Impact NFTs
- [ ] Project feed from Solar Foundation
- [ ] Enhanced leaderboards (tiered leagues)

### Version 3+
- [ ] Competitive territory mechanics
- [ ] Visual upgrade (isometric 2.5D)
- [ ] Advanced social features
- [ ] Cross-promotion with Solar Foundation projects
- [ ] 3D low-poly graphics option

---

## Launch Plan

### Testing Phases
1. **Testnet (Base Sepolia)** - Core mechanics testing
2. **Private Alpha** - Trusted testers, friends, community
3. **Public Launch** - Mainnet deployment

### Post-Launch Priorities (Balanced)
- User growth (marketing, partnerships, referrals)
- Feature development (v2 roadmap)
- Stability (bug fixes, optimization, support)
- Tokenomics tuning (adjust based on real data)

---

## Business & Legal

### Revenue Streams
1. Swap tax (5% on all trades)
2. In-game purchases (25% to treasury after burns/rewards)
3. Future: Premium features, cosmetics

### Entities
- Game ownership: TBD (existing company option available)
- Impact funding: Solar Foundation (501c3 nonprofit)

### Compliance
- Inherit Base Wallet geographic restrictions
- No formal legal opinion for v1
- Transparent tokenomics and admin limitations

---

## Asset Requirements

### Pixel Art Assets (v1)

**Solar Infrastructure:**
- Solar panel (multiple upgrade levels)
- Solar array
- Solar farm
- Mega solar farm
- Battery/storage units (multiple levels)

**Buildings:**
- Residential homes (3-4 variants, upgradeable)
- Schools (upgradeable)
- Hospitals (upgradeable)
- Factories (upgradeable)
- Town infrastructure (roads, parks)

**Workers:**
- Base worker sprite
- Upgraded worker variants

**UI Elements:**
- Resource icons ($SOLAR, ETH, power)
- Button styles
- Progress bars
- Leaderboard design
- Dashboard components

**Environment:**
- Ground/terrain tiles
- Day/night cycle (optional)
- Town background elements

### Audio (Optional for v1)
- Background music
- Construction sounds
- Reward/achievement sounds
- UI interaction sounds

---

## Key Metrics to Track

### Engagement
- Daily Active Users (DAU)
- Check-in streak distribution
- Session length
- Retention (D1, D7, D30)

### Economy
- $SOLAR generation rate vs burn rate
- Trading volume
- Token price stability
- LP depth

### Impact
- Total funds to Solar Foundation
- Player awareness of impact

### Growth
- New user signups
- Referral conversion rate
- Leaderboard participation

---

## Open Questions

1. **Initial liquidity:** Team-funded vs LBP - decide before launch
2. **Exact emission schedule:** Model based on projected player growth
3. **Legal entity:** Confirm which company will own the game
4. **Audit:** Consider community audit or bug bounty program

---

## Summary

SunCity is a solar farm building game that combines idle/incremental mechanics with meaningful real-world impact. Players build their own towns, power them with solar energy, earn $SOLAR tokens and ETH rewards, and contribute to funding actual solar projects through the Solar Foundation.

**Core Loop:**
1. Build solar panels and batteries
2. Power town buildings
3. Earn $SOLAR passively + achievement bonuses
4. Upgrade and expand
5. Climb leaderboard
6. Earn ETH rewards from daily fee distribution
7. Repeat

**Unique Value Proposition:**
- Play-to-earn with real-world solar impact
- Fair launch, community-first tokenomics
- Base-native miniapp experience
- Sustainable disinflationary token model
