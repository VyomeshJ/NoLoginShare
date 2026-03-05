'use client';

import { useRef, useState, useEffect} from 'react';
import Image from "next/image";

export default function Main() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expires, setExpires] = useState(21600); // seconds (1 hour)
  const [password, setPassword] = useState("");
  const [resultLink, setResultLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false)

  const [uploadError, setUploadError] = useState(false)
  useEffect(() => {
    setExpires(6 * 60 * 60);
  }, []);
  
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setUploadError(true);
      setLoading(false);
      return;
    }

    if (!password) {
      alert("Password is required");
      return;
    }
    setLoading(true);


    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("expires", expires.toString());
    formData.append("password", password);


    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        alert("Upload failed. Make sure file size is below 100mb");
        setUploadError(true)
        return;
      }
      const data = await res.json();
      setResultLink(`${window.location.origin}/download?id=${data.fileId}`);
      setUploadError(false)
      setUploaded(true);
    }catch (err) {
      alert(`Upload failed ${err}`);
    } finally {
      setLoading(false);
    }
  };




  return (
    <>
      <Image
        src="/bg.png"
        alt="Background"
        fill
        priority
        unoptimized
        className="object-cover -z-10"
      />
      <div className="fixed top-1/2 left-20 -translate-y-1/2  rounded-4xl w-full max-w-md min-h-[70vh] bg-white flex flex-col justify-around p-10 shadow-xl">
        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
          }}
        />

        <button disabled={loading} onClick={() => {
          fileInputRef.current?.click()
        }} 
        className="group flex items-center justify-center gap-4 rounded-2xl w-full h-20 bg-gray-200 hover:bg-[#1f7f41] transition-colors">
          {selectedFile == null && (
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0">
              <span className="text-2xl font-medium select-none text-black">
                +
              </span>
            </div>
            
          )}

          <h2 className="text-black group-hover:text-white font-pixel">
            {selectedFile ? selectedFile.name : "Upload Files"}
          </h2>

        </button>

        <div>
          <label className="text-sm text-black font-pixel">Expires In</label>
          <div className="flex gap-2">
            {[6, 12, 24].map(hours => (
              <button
                key={hours}
                type="button"
                onClick={() => setExpires(hours * 60 * 60)}
                className={`flex-1 rounded p-2 text-sm font-medium transition font-pixel
                  ${
                    expires === hours * 60 * 60
                      ? "bg-[#1f7f41] text-white"
                      : "text-black bg-gray-200 hover:bg-[#70be9e]"
                  }`}
              >
                {hours} hr
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-black font-pixel">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-[#1f7f41] p-2 rounded text-black"
          />
        </div>

        <div className="text-sm text-black">
          <p className="mb-1 font-pixel">Share link:</p>

          <div className="break-all rounded border bg-white p-3 text-[#1f7f41] select-all font-pixel">
            {resultLink}
          </div>
        </div>

        {/* {resultLink && (
          <div className="text-sm text-black">
            <p className="mb-1">Share link:</p>

            <div className="break-all rounded border bg-gray-100 p-3 text-blue-600 select-all">
              {resultLink}
            </div>
          </div>
        )} */}


        <button
          onClick={uploadFile}
          disabled={uploaded || !selectedFile || !password || loading}
          className={`w-full font-pixel h-12 rounded-xl text-white transition
            ${uploaded || loading || !selectedFile || !password
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#1f7f41] hover:bg-[#02592e]"}
          `}
        >
          {uploaded ? "Uploaded" : loading ? "Uploading..." : "Upload"}
        </button>
        <h2 className={`${uploadError ? "text-red-300" : "text-red-300/0"}`}>Upload failed. Make sure file size is below 100mb</h2>

        

      </div>
      
    <div className="fixed top-6 right-6 rounded-4xl w-full max-w-md bg-white flex flex-col justify-around p-10 shadow-xl">
      <h1 className="font-pixel text-black text-4xl">
        NoLoginShare
      </h1>

      <h2 className="text-xl text-black font-pixel space-y-1 mt-4 space-y-3">
        <p>
          - Share small files securely under <span className="text-red-300">100mb</span> in matter of seconds!
        </p>

        <p>
          - All files are encrypted while storing, so your data is safe.
        </p>

        <p>
          - Once the selected time limit is over, all of your data is automatically deleted from our files.
        </p>
      </h2>
    </div>
  </>
  );
}
