"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Main() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expires, setExpires] = useState(21600); // seconds (1 hour)
  const [password, setPassword] = useState("");
  const [resultLink, setResultLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setExpires(6 * 60 * 60);
  }, []);
  
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setUploadError("Upload failed. Make sure file size is below 100mb");
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
        body: formData,
      });

      if (!res.ok) {
        let message = "Upload failed";
        const contentType = res.headers.get("content-type") || "";

        try {
          if (contentType.includes("application/json")) {
            const data = await res.json();
            message = data.error || message;
          } else {
            const text = await res.text();
            message = text || message;
          }
        } catch {
          message = "Upload failed";
        }

        alert(message);
        setUploadError(message);
        return;
      }

      const data = await res.json();
      setResultLink(`${window.location.origin}/download?id=${data.fileId}`);
      setCopied(false);
      setUploadError("");
      setUploaded(true);
    } catch (err) {
      const message = `Upload failed ${err}`;
      alert(message);
      setUploadError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (!resultLink) return;

    await navigator.clipboard.writeText(resultLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10">
      <Image
        src="/bg.png"
        alt="Background"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="fixed inset-0 -z-10 object-cover"
      />

      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,460px)] lg:justify-between">
        <section className="order-2 w-full rounded-3xl bg-white p-5 text-black shadow-xl sm:p-8 lg:order-1">
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setSelectedFile(file);
            }}
          />

          <div className="flex min-h-[560px] flex-col gap-6 sm:min-h-[620px]">
            <button
              disabled={loading}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="group flex min-h-20 w-full items-center justify-center gap-3 rounded-2xl bg-gray-200 px-4 py-4 transition-colors hover:bg-[#1f7f41] disabled:cursor-not-allowed sm:gap-4"
            >
              {selectedFile == null && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-medium text-black sm:h-12 sm:w-12">
                  +
                </span>
              )}

              <span className="min-w-0 break-words text-center font-pixel text-sm text-black group-hover:text-white sm:text-base">
                {selectedFile ? selectedFile.name : "Upload Files"}
              </span>
            </button>

            <div className="space-y-2">
              <label className="text-sm text-black font-pixel">Expires In</label>
              <div className="grid grid-cols-3 gap-2">
                {[6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setExpires(hours * 60 * 60)}
                    className={`h-11 rounded p-2 text-sm font-medium transition font-pixel
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

            <div className="space-y-2">
              <label className="text-sm text-black font-pixel">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded border border-[#1f7f41] p-2 text-black outline-none focus:ring-2 focus:ring-[#1f7f41]"
              />
            </div>

            <div className="min-h-28 text-sm text-black">
              <p className="mb-1 font-pixel">Share link:</p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="min-h-16 flex-1 break-all rounded border bg-white p-3 text-[#1f7f41] select-all font-pixel">
                  {resultLink}
                </div>
                <button
                  type="button"
                  onClick={copyShareLink}
                  disabled={!resultLink}
                  className={`h-12 shrink-0 rounded px-4 font-pixel text-sm text-white transition sm:h-auto sm:min-w-24 ${
                    resultLink
                      ? "bg-[#1f7f41] hover:bg-[#02592e]"
                      : "cursor-not-allowed bg-gray-400"
                  }`}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button
                onClick={uploadFile}
                disabled={uploaded || !selectedFile || !password || loading}
                className={`h-12 w-full rounded-xl font-pixel text-white transition
                  ${
                    uploaded || loading || !selectedFile || !password
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#1f7f41] hover:bg-[#02592e]"
                  }
                `}
              >
                {uploaded ? "Uploaded" : loading ? "Uploading..." : "Upload"}
              </button>
              <p
                className={`min-h-6 text-center text-sm ${
                  uploadError ? "text-red-400" : "text-transparent"
                }`}
              >
                {uploadError || " "}
              </p>
            </div>
          </div>
        </section>

        <section className="order-1 w-full rounded-3xl bg-white p-5 text-black shadow-xl sm:p-8 lg:order-2 lg:self-start">
          <h1 className="break-words font-pixel text-3xl text-black sm:text-4xl">
            NoLoginShare
          </h1>

          <div className="mt-4 space-y-4 font-pixel text-base leading-7 text-black sm:text-lg">
            <p>
              - Share small files securely under{" "}
              <span className="text-red-300">100mb</span> in matter of seconds!
            </p>

            <p>
              - All files are encrypted while storing, so your data is safe.
            </p>

            <p>
              - Once the selected time limit is over, all of your data is
              automatically deleted from our files.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
