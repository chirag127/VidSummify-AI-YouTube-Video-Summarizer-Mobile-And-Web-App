Okay, here is a Product Requirements Document (PRD) for the React Native Expo YouTube summarizer app, incorporating all your specified features and technical constraints.

---

**Product Requirements Document: VidSummify (YouTube Summarizer)**

**Version:** 1.0
**Date:** May 23, 2024
**Status:** Final

**1. Introduction**

VidSummify is a cross-platform application (iOS, Android, Web PWA) built with React Native Expo. Its primary purpose is to allow users to generate concise summaries of YouTube videos using Google's Gemini 2.0 Flash-Lite model. Users can input video links via pasting or sharing directly from the YouTube app. Summaries are stored securely using Supabase, which also handles user authentication. The app features integrated text-to-speech (TTS) functionality with customizable speed, pitch, and voice settings, allowing users to listen to summaries. Users can manage their summary history, share summaries, and choose different summary formats.

**2. Goals**

*   **Primary:** Provide users with quick, AI-generated summaries of YouTube videos.
*   **Accessibility:** Offer text-to-speech functionality for consuming summaries audibly.
*   **Customization:** Allow users to select summary type (Brief, Detailed, Key Point) and length (Short, Medium, Long).
*   **Convenience:** Enable easy input via pasting or direct sharing from YouTube, provide history management, and allow sharing of summaries.
*   **User Control:** Provide fine-grained control over TTS playback (speed up to 16x, pitch, voice).
*   **Security & Privacy:** Ensure secure user authentication and isolated storage of user-specific summaries via Supabase.
*   **Cross-Platform Reach:** Deliver a consistent experience across iOS, Android, and the Web (as a PWA).

**3. Target Audience**

*   Users seeking to quickly understand the content of YouTube videos without watching them entirely (e.g., students, researchers, professionals).
*   Individuals who prefer consuming information via text or audio summaries.
*   Users needing accessible ways to consume video content information.
*   Mobile and web users looking for a convenient tool to process YouTube links.

**4. Functional Requirements**

**4.1. User Authentication (Supabase)**
    *   **FR4.1.1:** Users must be able to sign up using an email address and password.
    *   **FR4.1.2:** Users must be able to log in using their registered email and password.
    *   **FR4.1.3:** Users must be able to log in using Social Providers (Google initially, potentially others supported by Supabase Auth). Configuration via Supabase dashboard.
    *   **FR4.1.4:** Implement password reset functionality via email.
    *   **FR4.1.5:** Users must be able to log out of the application.
    *   **FR4.1.6:** Users must only be able to view and manage their own generated summaries (Authorization via Supabase Row Level Security - RLS).

**4.2. Summary Generation**
    *   **FR4.2.1:** Provide a dedicated text input field on the main screen for pasting YouTube video URLs.
    *   **FR4.2.2:** The app must register to handle `ACTION_SEND` intents (Android) and Share Extensions (iOS) for `text/plain` content containing URLs, specifically filtering for YouTube links.
    *   **FR4.2.3:** Implement **initial client-side validation** on the input URL to quickly check if the domain contains `youtube.com` or `youtu.be`. This is a preliminary check; robust validation occurs on the backend.
    *   **FR4.2.4:** Provide UI elements (e.g., dropdowns, segmented controls) for users to select the desired **Summary Type**:
        *   Options: "Brief", "Detailed", "Key Point".
        *   **Default:** "Brief".
    *   **FR4.2.5:** Provide UI elements for users to select the desired **Summary Length**:
        *   Options: "Short", "Medium", "Long".
        *   **Default:** "Medium".
    *   **FR4.2.6:** A "Summarize" button initiates the process, sending the URL, selected type, and selected length to the backend API.
    *   **FR4.2.7:** Display a loading indicator while the summary generation is in progress.
    *   **FR4.2.8:** Provide a clearly visible "Cancel" button during the summary generation process. Tapping this button must send a cancellation request to the backend (if feasible) or at least discard the result if it arrives after cancellation on the client-side.
    *   **FR4.2.9 (Backend):** The backend service must:
        *   Receive the request (URL, type, length, user auth token).
        *   Perform **robust validation** of the YouTube URL using `ytdlp-nodejs`.
        *   Use `ytdlp-nodejs` to attempt fetching the video transcript/captions.
        *   Use `ytdlp-nodejs` to attempt fetching the video title and thumbnail URL. **Failure to fetch title/thumbnail must NOT block summary generation.**
        *   **If transcript/captions are unavailable:** Return an error message to the client indicating the video cannot be summarized.
        *   **If transcript is available:** Prepare the prompt for Gemini 2.0 Flash-Lite based on the transcript, requested summary type, and length.
        *   Call the Gemini 2.0 Flash-Lite API to generate the summary.
        *   Handle potential API errors from Gemini (rate limits, content filtering, etc.) and return appropriate error messages.
        *   On successful summary generation, store the result in the Supabase `summaries` table associated with the authenticated user ID, including `video_url`, `video_title` (if fetched), `video_thumbnail_url` (if fetched), `summary_text` (in Markdown), `summary_type`, `summary_length`, and `created_at`.
        *   Return the generated summary (or error) to the frontend client.

**4.3. Summary Display**
    *   **FR4.3.1:** Display the most recently generated summary prominently after successful generation, typically replacing the input form or appearing above it.
    *   **FR4.3.2:** Display summaries using a Card component with the following details:
        *   Video Title (Display placeholder like "[Title Unavailable]" if fetch failed. Make the title tappable to open the original `video_url` in the browser/YouTube app).
        *   Video Thumbnail (Display a default placeholder image if fetch failed or URL is invalid).
        *   Summary Text (Rendered from fetched Markdown format).
        *   Summary Type (e.g., "Type: Brief").
        *   Summary Length (e.g., "Length: Medium").
        *   Read Aloud Button.
        *   Share Button.
        *   Delete Button.
        *   Edit Button.
        *   Original Video URL (Display the `video_url` text, potentially truncated with an option to copy).
    *   **FR4.3.3:** Ensure Markdown formatting (like headings, lists, bold, italics) within the summary text is correctly rendered.

**4.4. Text-to-Speech (TTS)**
    *   **FR4.4.1:** The "Read Aloud" button on a summary card initiates TTS playback of the `summary_text`.
    *   **FR4.4.2:** Implement TTS using `expo-speech` or a suitable alternative compatible with Expo managed workflow across all platforms.
    *   **FR4.4.3:** Provide playback controls (Play/Pause, Stop) once TTS is active.
    *   **FR4.4.4:** Allow users to adjust TTS **speed** via a slider or similar control in the Settings screen. The range should go up to 16x the normal speed. (Note: Test usability at very high speeds).
    *   **FR4.4.5:** Allow users to adjust TTS **pitch** via a slider or similar control in the Settings screen.
    *   **FR4.4.6:** Allow users to select the TTS **voice** from the available system voices (retrieved via the TTS library) in the Settings screen.
    *   **FR4.4.7:** TTS settings (speed, pitch, voice) must persist across app sessions for the logged-in user (e.g., stored in AsyncStorage or user profile in Supabase).
    *   **FR4.4.8:** The read-aloud feature must be available and functional for all summaries, regardless of their type or length.

**4.5. History Screen**
    *   **FR4.5.1:** Provide a dedicated "History" screen accessible via main navigation (e.g., tab bar, drawer).
    *   **FR4.5.2:** Display a list of all previously generated summaries for the currently logged-in user, ordered chronologically (most recent first).
    *   **FR4.5.3:** Each item in the history list must display:
        *   Video Thumbnail (or placeholder).
        *   Video Title (or placeholder).
    *   **FR4.5.4:** Tapping a history item should navigate the user to a view displaying the full summary card (as defined in FR4.3.2) for that entry.
    *   **FR4.5.5:** The history list should support lazy loading or pagination if the number of summaries becomes large.

**4.6. Summary Management**
    *   **FR4.6.1:** The "Delete" button on the summary card (and potentially swipe-to-delete in the history list) must allow users to permanently remove a summary from their history (delete the corresponding record in Supabase). Ask for confirmation before deletion.
    *   **FR4.6.2:** The "Edit" button on the summary card allows the user to change the Summary Type and/or Summary Length for that specific video URL. Selecting new options and confirming should trigger a *new* summary generation request to the backend with the original URL and the *new* parameters. The old summary entry should ideally be replaced or updated in Supabase.
    *   **FR4.6.3:** The "Share" button on the summary card must trigger the native platform sharing mechanism (using React Native's `Share` API).
    *   **FR4.6.4:** The content shared should include the Summary Text and optionally the original YouTube Video URL. Format clearly (e.g., "Summary for [Video Title]:\n\n[Summary Text]\n\nOriginal Video: [Video URL]").

**4.7. Settings Screen**
    *   **FR4.7.1:** Provide a dedicated "Settings" screen accessible via main navigation.
    *   **FR4.7.2:** Include controls for adjusting TTS settings as defined in FR4.4.4, FR4.4.5, and FR4.4.6. Changes should be applied immediately to subsequent TTS playback.
    *   **FR4.7.3:** Include an option for the user to log out (triggers FR4.1.5).
    *   **FR4.7.4:** (Optional but Recommended) Include links to Privacy Policy, Terms of Service, and potentially a "Send Feedback" option.
    *   **FR4.7.5:** (Optional but Recommended) Include an option to clear local cache if necessary.

**4.8. Progressive Web App (PWA)**
    *   **FR4.8.1:** Configure the Expo project (`app.json`) to generate PWA assets (manifest.json, service worker).
    *   **FR4.8.2:** Ensure the app is installable to the home screen on supported mobile browsers (iOS Safari "Add to Home Screen", Android Chrome "Install App").
    *   **FR4.8.3:** Implement basic offline support via the service worker (e.g., caching app shell, potentially cached summaries - consider data implications).

**5. Non-Functional Requirements**

*   **NF5.1. Performance:**
    *   Optimize bundle size for faster loading, especially for the PWA.
    *   Ensure smooth UI performance and responsiveness on target devices/browsers.
    *   Minimize latency for summary generation; provide clear feedback during waits.
    *   Optimize Supabase queries, especially for the history list.
*   **NF5.2. Usability:**
    *   Intuitive navigation and user flow.
    *   Clear visual feedback for user actions (button presses, loading states, errors, success).
    *   Consistent UI/UX across all platforms (iOS, Android, Web).
    *   Accessible design (consider color contrast, touch target sizes).
*   **NF5.3. Reliability:**
    *   Gracefully handle API errors (Gemini, ytdlp, Supabase).
    *   Stable TTS playback.
    *   Reliable data persistence in Supabase.
    *   Handle network connectivity issues gracefully (e.g., inform user, allow retries).
*   **NF5.4. Security:**
    *   Securely manage Supabase API keys and service roles (backend).
    *   Frontend Supabase keys should be public, but RLS must be properly configured to protect user data.
    *   Protect against common web vulnerabilities if applicable (e.g., XSS in summary display - ensure Markdown renderer sanitizes input).
*   **NF5.5. Maintainability:**
    *   Implement a modular project structure as specified (separate `frontend/` and `backend/`, component-based UI).
    *   Use clear, commented code following JavaScript/React Native best practices.
    *   Utilize environment variables for configuration (API keys, Supabase URL).
*   **NF5.6. Compatibility:**
    *   Target recent versions of iOS and Android.
    *   Support modern web browsers (Chrome, Firefox, Safari, Edge) for the PWA.

**6. Design & UI/UX Considerations**

*   Adopt a clean, modern aesthetic.
*   Use a consistent color palette and typography.
*   Emphasize clarity and ease of use in the layout.
*   Utilize clear loading indicators (e.g., spinners, skeleton loaders) during asynchronous operations.
*   Ensure the Markdown rendering is clean and readable within the card format.
*   Navigation should be intuitive (e.g., bottom tab bar for main screens like Home, History, Settings).

**7. Technical Specifications**

*   **Frontend:**
    *   Framework/Platform: React Native Expo (Managed Workflow)
    *   Language: JavaScript
    *   State Management: React Context API, Zustand, or Redux Toolkit (Choose one)
    *   Navigation: React Navigation
    *   TTS: `expo-speech`
    *   UI Libraries: (Optional, e.g., React Native Paper, NativeBase)
    *   Markdown Rendering: `react-native-markdown-display` or similar
*   **Backend:**
    *   Framework: Node.js + Express.js
    *   Language: JavaScript or TypeScript
    *   YouTube Interaction: `ytdlp-nodejs` (for validation, transcript, title, thumbnail)
    *   AI Integration: Official Google AI Gemini SDK/Client Library
    *   Database/Auth Client: `@supabase/supabase-js`
*   **AI Model:** Google Gemini 2.0 Flash-Lite
*   **Database & Authentication:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage if needed for thumbnails - though URLs are likely sufficient)
*   **Hosting:**
    *   Frontend: Expo Application Services (EAS) Build, Web hosted on Vercel/Netlify/GitHub Pages.
    *   Backend: Render, Fly.io, Heroku, or similar Node.js hosting provider.
*   **Project Structure:**
    ```
    /vidsummify
      ├── frontend/  (React Native Expo App)
      │   ├── src/
      │   │   ├── components/
      │   │   ├── screens/
      │   │   ├── navigation/
      │   │   ├── services/ (API calls, Supabase client)
      │   │   ├── store/ (State management)
      │   │   ├── utils/
      │   │   └── hooks/
      │   ├── app.json
      │   └── package.json
      ├── backend/   (Express.js API)
      │   ├── src/
      │   │   ├── routes/
      │   │   ├── controllers/
      │   │   ├── services/ (Gemini, ytdlp, Supabase admin)
      │   │   ├── middleware/ (Auth)
      │   │   └── utils/
      │   ├── .env
      │   └── package.json
      └── README.md
    ```

**8. Data Management (Supabase)**

*   **Authentication:** Utilize Supabase Auth for user management and JWT handling.
*   **Database Schema:**
    *   Table: `summaries`
        *   `id`: UUID (Primary Key, default: `uuid_generate_v4()`)
        *   `user_id`: UUID (Foreign Key referencing `auth.users.id`, ON DELETE CASCADE)
        *   `video_url`: TEXT (Not Null)
        *   `video_title`: TEXT (Nullable)
        *   `video_thumbnail_url`: TEXT (Nullable)
        *   `summary_text`: TEXT (Not Null, Markdown format)
        *   `summary_type`: TEXT (Enum/Check constraint: 'Brief', 'Detailed', 'Key Point')
        *   `summary_length`: TEXT (Enum/Check constraint: 'Short', 'Medium', 'Long')
        *   `created_at`: TIMESTAMPTZ (Default: `now()`)
    *   **Row Level Security (RLS):** Implement RLS policies on the `summaries` table to ensure users can only `SELECT`, `INSERT`, `UPDATE`, `DELETE` their own records based on `auth.uid() = user_id`.

**9. Error Handling & Edge Cases**

*   **Invalid URL:** Display clear error messages for invalid or non-YouTube URLs (client and server-side).
*   **Video Not Found/Private:** Inform the user if the video is inaccessible via `ytdlp-nodejs`.
*   **No Transcript:** Explicitly inform the user that a summary cannot be generated because no transcript or captions are available for the video.
*   **API Errors (Gemini):** Display user-friendly messages for Gemini API failures (e.g., "Could not generate summary at this time", "Content filter triggered"). Log detailed errors on the backend.
*   **API Errors (Supabase):** Handle potential database or auth errors.
*   **Network Issues:** Detect and inform the user about connectivity problems. Implement retry logic where appropriate.
*   **TTS Failure:** Handle errors from the `expo-speech` library (e.g., engine initialization failure).
*   **Cancellation:** Ensure cancelled requests don't result in unexpected state changes or data storage.
*   **Long Summaries:** Ensure UI handles potentially long summary text gracefully (e.g., scrolling within the card).

---

the following is the example code for the backend API endpoint to generate summaries using the Gemini 2.0 Flash-Lite model:

```javascriptconst {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("node:fs");
const mime = require("mime-types");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [
  ],
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  // TODO: Following code needs to be updated for client-side apps.
  const candidates = result.response.candidates;
  for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
    for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
      const part = candidates[candidate_index].content.parts[part_index];
      if(part.inlineData) {
        try {
          const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
          fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`Output written to: ${filename}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  console.log(result.response.text());
}

run();
```

the following is the example code for the backend API endpoint to get the video transcript using `ytdlp-nodejs`:

```javascript
const ytdlp = require("ytdlp-nodejs");

import { YtDlp } from 'ytdlp-nodejs';

const ytdlp = new YtDlp();

const info = await ytDlp.getInfoAsync(
    'https://www.youtube.com/watch?v=dU7GwCOgvNY'
  );

console.log(info);
```