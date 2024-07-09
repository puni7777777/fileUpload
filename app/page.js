// Client-side component
'use client'

import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {
  const fileInputRef = useRef(null);
  const [fileInput, setFileInput] = useState();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [upload, setUpload] = useState('')

  const handleFileChange = (e) => {
    setFileInput(e.target.files?.[0]);
  };

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!fileInput) {
      setError("No file selected");
      return;
    }

    setUploading(true);
    setError(null);

    var formdata = new FormData();
    formdata.set("files", fileInput);

    var requestOptions = { method: 'POST', body: formdata };

    try {
      const response = await fetch("/pages/api", requestOptions);
      if (!response.ok) throw new Error(await response.text())

      setUploading(false);
      // console.log('upload successfull')
      setUpload('uploaded successfully')
      setFileInput()
    } catch (error) {
      console.error("Error uploading file: " + error.message);
      setUploading(false);
      setError(error.message);
    }
  }

  async function execCommand() {
    try {
      const req = await fetch("/pages/api/execute");
      const data = await req.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
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
      <div className="flex flex-col">
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          error ? (
            <p className="text-red-500 p-3">{error}</p>
          ) : (
            <p className="p-3">Select a file to upload</p>
          )
        )}
        <div className="flex flex-col gap-5">
          <button onClick={uploadFile} className="bg-red-500 rounded-lg p-3 hover:bg-red-600">Upload File</button>
          <button onClick={execCommand} className="text-black bg-white rounded-lg p-3 hover:bg-zinc-400">execute command</button>
        </div>
        <p>{upload}</p>
      </div>
    </div>
  );
}
