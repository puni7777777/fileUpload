# 🎬 In-Browser Video Trimmer & Editor

A high-performance, **100% client-side** video trimming web application built with **Next.js 14**, **React**, **Tailwind CSS**, and **FFmpeg WebAssembly (`@ffmpeg/ffmpeg`)**.

Process, trim, and download videos directly inside your browser without uploading your files to any external backend server. Fast, private, and fully deployable to **GitHub Pages**.

---

## ✨ Features

- 🔒 **100% Client-Side & Private**: Video files never leave your device. All demuxing, trimming, and transcoding happen directly in your browser using WebAssembly.
- 🎞️ **Multi-Format Support**: Process virtually all popular video formats:
  - **MP4 / M4V** (`.mp4`, `.m4v`)
  - **WebM** (`.webm`)
  - **QuickTime** (`.mov`, `.qt`)
  - **Matroska** (`.mkv`)
  - **AVI** (`.avi`)
  - **Windows Media** (`.wmv`, `.asf`)
  - **Flash Video** (`.flv`)
  - **MPEG Transport Stream** (`.ts`, `.mts`, `.m2ts`)
  - **MPEG** (`.mpg`, `.mpeg`, `.vob`)
  - **Ogg Theora** (`.ogv`, `.ogg`)
  - **3GP** (`.3gp`, `.3g2`)
- ⚡ **Adaptive FFmpeg Pipeline**:
  - **Fast Stream Copy (`-c copy`)**: Automatically applied for compatible containers (`.mp4`, `.mov`) for near-instant lossless cutting without re-encoding.
  - **Universal Fallback Transcoder**: Automatically re-encodes non-web containers (`.mkv`, `.avi`, `.webm`, `.flv`, etc.) to universal **H.264 + AAC MP4** using ultrafast encoding.
- 🚀 **Web-Ready Playback (`+faststart`)**: Automatically reorganizes MP4 metadata (`moov` atom placed at the head of the file) so the trimmed video plays instantly in HTML5 `<video>` players.
- 🧹 **Metadata Stripping (`-map_metadata -1`)**: Automatically cleans up recording tags (such as *Microsoft Game DVR* or window title tags) from screen recording software.
- ⏱️ **Flexible Timestamp Parsing**: Enter start and end times in `HH:MM:SS:FF`, `HH:MM:SS`, `MM:SS`, or raw seconds.
- 🌐 **Static Hosting Ready**: Configured for automated deployment to **GitHub Pages**, Cloudflare Pages, Vercel, or Netlify.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Media Engine**: [@ffmpeg/ffmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) & [@ffmpeg/util](https://github.com/ffmpegwasm/ffmpeg.wasm) (WebAssembly FFmpeg 0.12)
- **CI/CD**: GitHub Actions

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` / `pnpm` / `bun`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/videoediting.git
   cd videoediting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Use

1. **Select a Video**: Click the file input and choose any video from your device.
2. **Preview**: The video player will load the clip and display its duration.
3. **Set Time Range**:
   - **From**: Enter the start timestamp (e.g., `00:00:02:00` or `00:00:02`).
   - **To**: Enter the end timestamp (e.g., `00:00:10:00` or `00:00:10`).
4. **Prepare / Upload**: Click **Upload File** to validate the media and warm up the browser's FFmpeg engine.
5. **Trim**: Click **Trim video**. FFmpeg will cut the clip in browser memory and immediately load the trimmed video into the player for preview.
6. **Download**: Click **Download video** to save the trimmed MP4 file to your computer.

---

## 📝 License

This project is licensed under the MIT License.
