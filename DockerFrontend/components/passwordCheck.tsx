"use client";

import { useState, useEffect} from "react";
import { useParams, useSearchParams } from 'next/navigation';

import Image from "next/image";



export default function PasswordCheck() {
  const API = process.env.NEXT_PUBLIC_API_URL;


  const [errorFound, setErrorFound] = useState(false);
  const [passwordIncorrect, setPasswordIncorrect] = useState(false)
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [exists, setExists] = useState(true);
  const params = useSearchParams()
  const id = params.get('id');
  
  const checkPasswordAndDownload = async () => {
    const res = await fetch(`/api/files/${id}/check?password=${encodeURIComponent(password)}`)
    if (!res.ok) {
      setError("Wrong password");
      setPasswordIncorrect(true)
      console.log("bullshit")
      return;
    }
    setPasswordIncorrect(false)
    console.log("works")

    window.location.href = `/api/files/${id}?password=${encodeURIComponent(password)}`;
  };
  const checkExistence = async () => {
    const res = await fetch(`/api/files/${id}/checkexistence`)
    const data = await res.json()
    if (data.existence === "Database error"){
      setExists(false)
    }
    else if (data.existence === "file not found"){
      setExists(false)
    }
  }
  useEffect(() => {
    if (id) {
      checkExistence();
    }
  }, [id]);

  

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Image
          src="/bg.png"
          alt="Background"
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow z-10">
          {!exists && 
            <h2 className="text-lg font-medium text-center text-red-300">
              File has expired or does not exist
            </h2>
          }
          {
            exists && 
            <>
              <h2 className="text-lg font-medium mb-4 text-center text-black font-pixel">
                Enter password
              </h2>

              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    checkPasswordAndDownload()
                  }
                }}
                placeholder="Password"
                className={`w-full border ${ passwordIncorrect ? 'border-red-700' : 'border-black'} rounded p-3 text-center focus:outline-none focus:ring-2  ${ passwordIncorrect ? 'focus:ring-red-700' : 'focus:ring-black'} text-black`}
              />
              {
                passwordIncorrect && 
                <h2 className="text-lg font-medium mb-4 text-center text-red-300 mt-10 font-pixel">
                  Password Incorrect
                </h2>
              }
          </>
          }
          
          
        </div>
      </div>
    </>
    
    
  );
}