"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PasswordCheck() {
  const [passwordIncorrect, setPasswordIncorrect] = useState(false);
  const [password, setPassword] = useState("");
  const [exists, setExists] = useState(true);
  const params = useSearchParams();
  const id = params.get("id");
  
  const checkPasswordAndDownload = async () => {
    const res = await fetch(`/api/files/${id}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setPasswordIncorrect(true);
      return;
    }

    setPasswordIncorrect(false);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "download";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let cancelled = false;

    async function checkExistence() {
      if (!id) return;

      const res = await fetch(`/api/files/${id}/checkexistence`);
      const data = await res.json();
      if (cancelled) return;

      if (data.existence === "Database error" || data.existence === "file not found") {
        setExists(false);
      }
    }

    checkExistence();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-x-hidden bg-gray-100 px-4 py-8">
      <Image
        src="/bg.png"
        alt="Background"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="fixed inset-0 -z-10 object-cover"
      />
      <section className="z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow sm:p-6">
        {!exists && (
          <h2 className="text-center font-pixel text-lg text-red-300">
            File has expired or does not exist
          </h2>
        )}
        {exists && (
          <>
            <h2 className="mb-4 text-center font-pixel text-lg text-black">
              Enter password
            </h2>

            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  checkPasswordAndDownload();
                }
              }}
              placeholder="Password"
              className={`w-full rounded border p-3 text-center font-pixel text-black focus:outline-none focus:ring-2 ${
                passwordIncorrect
                  ? "border-red-700 focus:ring-red-700"
                  : "border-black focus:ring-black"
              }`}
            />
            {passwordIncorrect && (
              <p className="mt-8 mb-4 text-center font-pixel text-lg font-medium text-red-300">
                Password Incorrect
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
