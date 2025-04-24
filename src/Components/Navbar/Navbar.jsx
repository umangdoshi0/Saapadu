import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoCart } from "react-icons/io5";
import { FaUser, FaMicrophone } from "react-icons/fa";
import "./Navbar.css";
import Logo from "../Navbar/Logo/Logo";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        await handleTranscribe(blob);

        // Stop all audio tracks after recording is done
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);

      // Stop recording after 5 seconds
      setTimeout(() => {
        recorder.stop();
        setIsRecording(false);
      }, 5000);
    } catch (error) {
      console.error("Microphone access error:", error);
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    setIsLoading(true);
    try {
      const response = await fetch("https://b3db-2405-201-e024-5178-dcfa-3a56-7334-2964.ngrok-free.app/api/transcribe", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      setSearchQuery(data.text || "");
    } catch (error) {
      console.error("Transcription failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder?.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaRecorder]);

  return (
    <div className="navbar">
      <div className="navleft">
        <Logo />
      </div>
      <div className="navmiddle">
        <input
          type="text"
          placeholder="Search Cafes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FaMicrophone
          className={`mic-icon ${isRecording ? "recording" : ""}`}
          onClick={isRecording || isLoading ? null : startRecording}
          style={{ cursor: isRecording || isLoading ? "not-allowed" : "pointer" }}
          title={isRecording ? "Recording..." : isLoading ? "Transcribing..." : "Click to record"}
        />
      </div>
      <div className="navright">
        <Link to="/cart"><IoCart className="cart-icon" /></Link>
        <Link to="/account"><FaUser className="acct-icon" /></Link>
      </div>
    </div>
  );
}

export default Navbar;