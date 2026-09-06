// Client-side component
'use client';

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function Home() {
  const ffmpegRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const isTrimmedRef = useRef(false);
  const createdUrlsRef = useRef([]);

  const [fileInput, setFileInput] = useState();
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoDuration, setVideoDuration] = useState("");
  const [trimmedBlob, setTrimmedBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [upload, setUpload] = useState(null);
  const [startTime, setStartTime] = useState('00:00:00:00');
  const [endTime, setEndTime] = useState('00:00:00:00');

  // Clean up object URLs only when component unmounts to prevent premature revocation
  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
      createdUrlsRef.current = [];
    };
  }, []);

  const createSafeObjectUrl = (blobOrFile) => {
    const url = URL.createObjectURL(blobOrFile);
    createdUrlsRef.current.push(url);
    return url;
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) {
      return ffmpegRef.current;
    }
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
    } catch (err) {
      console.warn("Primary CDN load failed, attempting fallback CDN...", err);
      const fallbackURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${fallbackURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${fallbackURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
    }
    return ffmpeg;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      isTrimmedRef.current = false;
      setFileInput(file);
      const url = createSafeObjectUrl(file);
      setVideoSrc(url);
      setTrimmedBlob(null);
      setError(null);
      setUpload(null);
    }
  };

  const handleLoadedMetadata = (e) => {
    const dur = e.target.duration;
    if (dur && !isNaN(dur)) {
      setVideoDuration(`${dur.toFixed(2)}s`);
      if (!isTrimmedRef.current && endTime === '00:00:00:00') {
        const totalSecs = Math.floor(dur);
        const hours = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSecs % 60).padStart(2, '0');
        const frames = String(Math.floor((dur % 1) * 100)).padStart(2, '0');
        setEndTime(`${hours}:${mins}:${secs}:${frames}`);
      }
    }
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    if (parts.length === 4) {
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      const s = parseFloat(parts[2]) || 0;
      const f = parseFloat(parts[3]) || 0;
      return h * 3600 + m * 60 + s + (f / 100);
    }
    if (parts.length === 3) {
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      const s = parseFloat(parts[2]) || 0;
      return h * 3600 + m * 60 + s;
    }
    if (parts.length === 2) {
      const m = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]) || 0;
      return m * 60 + s;
    }
    return parseFloat(timeStr) || 0;
  }

  function secondsToFFmpegTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    if (ms > 0) {
      const mss = String(ms).padStart(3, '0');
      return `${hh}:${mm}:${ss}.${mss}`;
    }
    return `${hh}:${mm}:${ss}`;
  }

  const uploadFile = async (e) => {
    e?.preventDefault?.();
    if (!fileInput) {
      setError("No file selected");
      return;
    }

    if (!fileInput.name.toLowerCase().endsWith('.mp4')) {
      setError("Only mp4 files are allowed");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await loadFFmpeg();
      setUploading(false);
      setUpload('uploaded successfully');
    } catch (error) {
      console.error("Error uploading file: " + error.message);
      setUploading(false);
      setError(error.message);
    }
  };

  async function execCommand() {
    if (!fileInput) {
      setError("No file selected");
      return;
    }

    try {
      setError(null);
      setUploading(true);
      setUpload("Trimming video...");

      const ffmpeg = await loadFFmpeg();
      const startSec = parseTimeToSeconds(startTime);
      const endSec = parseTimeToSeconds(endTime);

      if (endSec <= startSec) {
        setUploading(false);
        setError("End time must be greater than start time");
        return;
      }

      const startStr = secondsToFFmpegTime(startSec);
      const endStr = secondsToFFmpegTime(endSec);

      const inputName = "input.mp4";
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(fileInput));

      // Key fix: "-ss" and "-to" before "-i", along with "-avoid_negative_ts make_zero" and "-movflags +faststart"
      let ret = await ffmpeg.exec([
        "-ss", startStr,
        "-to", endStr,
        "-i", inputName,
        "-c", "copy",
        "-avoid_negative_ts", "make_zero",
        "-movflags", "+faststart",
        outputName
      ]);

      // Fallback to ultrafast encoding if stream copy fails
      if (ret !== 0) {
        console.warn("Stream copy failed, falling back to encoding...");
        ret = await ffmpeg.exec([
          "-ss", startStr,
          "-to", endStr,
          "-i", inputName,
          "-preset", "ultrafast",
          "-movflags", "+faststart",
          outputName
        ]);
      }

      if (ret !== 0) {
        throw new Error("FFmpeg failed to trim video");
      }

      const data = await ffmpeg.readFile(outputName);
      
      // Ensure only the exact binary slice is converted to a Blob
      const fileBytes = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength
      );
      const blob = new Blob([fileBytes], { type: "video/mp4" });

      isTrimmedRef.current = true;
      setTrimmedBlob(blob);

      const trimmedUrl = createSafeObjectUrl(blob);
      setVideoSrc(trimmedUrl);

      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch (cleanupErr) {
        // ignore cleanup error
      }

      setUploading(false);
      setUpload("video trimmed");
      console.log({ status: "video trimmed", data: blob });
    } catch (error) {
      console.error(error);
      setUploading(false);
      setError(error.message || "Failed to trim video");
    }
  }

  async function downloadFile() {
    const fileToDownload = trimmedBlob || fileInput;
    if (!fileToDownload) {
      setError("No file selected");
      return;
    }
    try {
      const url = createSafeObjectUrl(fileToDownload);
      const a = document.createElement('a');
      a.href = url;
      a.download = trimmedBlob ? `trimmed_${fileInput.name}` : fileInput.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file: " + error.message);
      setError(error.message);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen font-mono gap-3">
      <div className="flex flex-col items-center">
        {fileInput && <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          controls
          playsInline
          width="350"
          onLoadedMetadata={handleLoadedMetadata}>
        </video>
        }
        {fileInput && <p>{videoDuration}</p>}
      </div>
      <div>
        <input
          type="file"
          id="file"
          name="file"
          className="w-full border border-slate-200 rounded-lg py-3 px-5 outline-none	bg-transparent"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>
      <div className="flex flex-col items-center">
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          error ? (
            <p className="text-red-500 p-3">{error}</p>
          ) : upload ? (
            <p>{upload}</p>
          ) : (
            <p className="p-3">Select a file to upload</p>
          )
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex gap-7">
          <div className="flex flex-col">
            <label htmlFor="">From</label>
            <input type="text" value={startTime} onChange={handleStartTimeChange} className='bg-gray-800 text-red-500 border-0 rounded-md p-2 mb-4 focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 transition ease-in-out duration-150' placeholder="00:00:00:00" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="">To</label>
            <input type="text" value={endTime} onChange={handleEndTimeChange} className='bg-gray-800 text-red-500 border-0 rounded-md p-2 mb-4 focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500 transition ease-in-out duration-150' placeholder="00:00:00:00" />
          </div>
          {/* make time input work and create so that it is in format 00:00:00:00 */}
        </div>
        <div className="flex flex-col gap-5">
          <button onClick={uploadFile} className="bg-red-500 rounded-lg p-3 hover:bg-red-600">Upload File</button>
          <button onClick={execCommand} className="text-black bg-white rounded-lg p-3 hover:bg-zinc-400">Trim video</button>
          <button onClick={downloadFile} className="text-black bg-white rounded-lg p-3 hover:bg-zinc-400">Download video</button>
        </div>
      </div>
    </div >
  );
}
