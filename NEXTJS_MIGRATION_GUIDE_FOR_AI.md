# MASTER MIGRATION GUIDE: Laravel to Next.js (AssessmentBD)

**ATTENTION AI AGENT:** You are taking over a critical migration project. Your task is to convert the `assessmentbd` Laravel project into the `assessmentbd-next` Next.js project.

**CRITICAL RULE:** **DO NOT MODIFY THE LARAVEL PROJECT IN ANY WAY.** The Laravel project is currently **LIVE**, hosted on a shared server, and has active users. You must treat the Laravel project as a **READ-ONLY REFERENCE**. If you break the Laravel project, you break the live site.

## 🎯 The Ultimate Goal
We are moving from a Laravel blade monolith to a Next.js (React) front-end. 
Once completed, this Next.js project will replace the Laravel project on the main domain. 
**The transition must be completely invisible to the user.**
- They must see the **EXACT SAME UI**, exact same CSS, exact same fonts, and exact same Bengali text.
- They must experience the **EXACT SAME FUNCTIONALITY** (line-by-line feature parity).

## 🛠 Project Structure
- **Laravel Project (READ-ONLY REFERENCE):** `E:\All Projects\assessmentbd`
- **Next.js Project (ACTIVE WORKSPACE):** `E:\All Projects\assessmentbd-next`

## 📋 Strict Guidelines for the AI Agent

### 1. 100% Carbon Copy UI
- **No approximations.** If the Laravel site uses a specific color, border, padding, or Bengali string, you must copy it exactly.
- **Assets:** The `public/build` (Vite compiled assets from Laravel) and `public/images` have already been copied to the Next.js project. We are using the exact same Tailwind utility classes to ensure 100% fidelity.
- **Do not invent designs.** Just map the Blade HTML (`resources/views`) directly to Next.js React components (`src/app`).

### 2. Line-by-Line Functionality
- Translate Laravel Controllers and Alpine.js logic into Next.js Server Actions and React state (`useState`, `useEffect`).
- If there's a feature in Laravel (e.g., anti-copy protection on exam pages, referral code logic, time tracking), it MUST exist in the Next.js version exactly as it did.

### 3. Database Connectivity
- The Next.js project uses **Prisma ORM**.
- It must connect to the **live MySQL database** (or a perfect replica of it) so user data, courses, and exams are perfectly synced. 
- The `.env` file in the Next.js project contains the connection string. Read the Prisma schema (`prisma/schema.prisma`) to understand the table structures.

### 4. What has been done so far
- Prisma has been configured (v5.20.0).
- `login`, `register`, and the `home` page (layout, header, footer) have been perfectly carbon-copied.
- Header has been extracted to a Next.js Client Component (`src/components/Header.tsx`) while the `AuthNav` uses Server Components to read sessions safely.

### 5. Next Steps for You (The AI Agent)
- Pick up the next Blade template (e.g., `courses`, `dashboard`, `exams`).
- Read the corresponding `.blade.php` file in the Laravel project.
- Read the corresponding Controller in the Laravel project (`app/Http/Controllers`) to understand what data is passed to the view.
- Create the equivalent Server Action and Prisma query in Next.js.
- Create the React Component in Next.js replicating the UI 1:1.

## 🚀 Final Delivery
The user will eventually delete the Laravel files from their shared hosting and point the main domain to this Next.js build. Ensure the Next.js project is fully production-ready, highly optimized, and a flawless clone of the original site.
