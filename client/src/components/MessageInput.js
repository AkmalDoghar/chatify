'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import api from '../utils/api';

export default function MessageInput({ onSendMessage, onTyping, onStopTyping }) {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [recordingPeaks, setRecordingPeaks] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const previewAudioRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      if (onTyping) onTyping();
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (onStopTyping) onStopTyping();
    }, 2000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── LIVE WAVEFORM VIA WEB AUDIO API ──────────────────────────
  const startWaveformCapture = (stream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const BAR_COUNT = 40;

      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        // Downsample to BAR_COUNT bars
        const step = Math.floor(dataArray.length / BAR_COUNT);
        const peaks = Array.from({ length: BAR_COUNT }, (_, i) => {
          const val = dataArray[i * step] || 0;
          return Math.max(8, Math.round((val / 255) * 100));
        });
        setRecordingPeaks(peaks);
        animFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (e) {
      // fallback: random bars
    }
  };

  // ── VOICE RECORDING ──────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordingPeaks([]);
      startWaveformCapture(stream);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 120) { stopRecording(); return s; }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access is required. Please allow it in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const cancelVoice = () => {
    if (isRecording) stopRecording();
    cancelAnimationFrame(animFrameRef.current);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setRecordingPeaks([]);
    setIsPlayingPreview(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
  };

  const togglePreviewPlay = () => {
    if (!audioUrl) return;
    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
    setUploadingVoice(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = reader.result;
        try {
          const response = await api.post('/upload', { file: base64 });
          onSendMessage({ content: response.data.url, messageType: 'voice' });
        } catch (err) {
          console.error('Voice upload failed, using base64:', err);
          onSendMessage({ content: base64, messageType: 'voice' });
        } finally {
          setUploadingVoice(false);
          cancelVoice();
        }
      };
    } catch (err) {
      console.error('Voice send failed:', err);
      setUploadingVoice(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedImage) || uploading) return;
    if (isTyping) { setIsTyping(false); if (onStopTyping) onStopTyping(); }

    let messageType = 'text';
    let messageContent = text.trim();

    if (selectedImage) {
      setUploading(true);
      try {
        const response = await api.post('/upload', { image: selectedImage });
        messageContent = response.data.url;
        messageType = 'image';
      } catch (err) {
        messageContent = selectedImage;
        messageType = 'image';
      } finally {
        setUploading(false);
      }
    }

    onSendMessage({ content: messageContent, messageType });
    setText('');
    setSelectedImage(null);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const BAR_COUNT = 40;
  const previewBars = Array.from({ length: BAR_COUNT }, (_, i) => {
    if (recordingPeaks.length > 0) return recordingPeaks[i] || 8;
    return Math.max(8, Math.min(90, ((i * 37 + 23) % 80) + 10));
  });

  // ── VOICE PREVIEW (after stop) ─────────────────────────────
  if (audioBlob && !isRecording) {
    return (
      <div style={{
        padding: '12px 20px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)',
          borderRadius: '28px',
          padding: '10px 14px',
          border: '1.5px solid rgba(84,194,80,0.3)',
          boxShadow: '0 4px 20px rgba(84,194,80,0.12)',
        }}>
          {/* Discard */}
          <button
            type="button"
            onClick={cancelVoice}
            style={{
              width: '38px', height: '38px', borderRadius: '50%', border: 'none',
              backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            title="Discard"
          >
            <Trash2 size={16} />
          </button>

          {/* Play / Pause Preview */}
          <button
            type="button"
            onClick={togglePreviewPlay}
            style={{
              width: '38px', height: '38px', borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #54c250, #3F8F82)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 4px 14px rgba(84,194,80,0.4)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isPlayingPreview ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
          </button>

          {/* Waveform preview */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '32px' }}>
            {previewBars.map((h, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${h}%`,
                backgroundColor: isPlayingPreview ? '#54c250' : 'rgba(63,143,130,0.45)',
                borderRadius: '3px',
                transition: 'background-color 0.3s ease',
              }} />
            ))}
          </div>

          {/* Duration */}
          <span style={{
            fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace',
            color: '#3F8F82', flexShrink: 0,
          }}>
            {formatDuration(recordingSeconds)}
          </span>

          {/* Send */}
          <button
            type="button"
            onClick={sendVoiceMessage}
            disabled={uploadingVoice}
            style={{
              width: '42px', height: '42px', borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #54c250, #3F8F82)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploadingVoice ? 'not-allowed' : 'pointer', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(84,194,80,0.45)',
              opacity: uploadingVoice ? 0.7 : 1,
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => !uploadingVoice && (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Send voice message"
          >
            {uploadingVoice ? <Loader2 size={18} className="spin-loader" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    );
  }

  // ── RECORDING ACTIVE ───────────────────────────────────────
  if (isRecording) {
    return (
      <div style={{
        padding: '12px 20px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)',
          borderRadius: '28px',
          padding: '10px 14px',
          border: '1.5px solid rgba(239,68,68,0.25)',
          boxShadow: '0 4px 20px rgba(239,68,68,0.1)',
        }}>
          {/* Pulsing mic */}
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)', color: '#EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, animation: 'pulse 1.2s ease-in-out infinite',
          }}>
            <Mic size={18} />
          </div>

          {/* Live waveform */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '32px' }}>
            {previewBars.map((h, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${h}%`,
                backgroundColor: '#EF4444',
                borderRadius: '3px',
                opacity: 0.7 + (i % 3) * 0.1,
                transition: 'height 0.12s ease',
              }} />
            ))}
          </div>

          {/* Recording dot + timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#EF4444', display: 'inline-block',
              animation: 'pulse 1s ease infinite',
            }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, fontFamily: 'monospace', color: '#EF4444' }}>
              {formatDuration(recordingSeconds)}
            </span>
          </div>

          {/* Stop */}
          <button
            type="button"
            onClick={stopRecording}
            style={{
              width: '42px', height: '42px', borderRadius: '50%', border: 'none',
              backgroundColor: '#EF4444', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Stop recording"
          >
            <Square size={14} fill="white" />
          </button>
        </div>
      </div>
    );
  }

  // ── NORMAL INPUT ───────────────────────────────────────────
  return (
    <div style={{
      padding: '12px 20px',
      backgroundColor: 'var(--bg-panel)',
      borderTop: '1px solid var(--border-color)',
    }}>
      {/* Image preview */}
      {selectedImage && (
        <div style={{
          position: 'relative', display: 'inline-block', marginBottom: '10px',
          borderRadius: '14px', overflow: 'hidden', border: '2px solid var(--accent-coral)',
        }}>
          <img src={selectedImage} alt="Preview" style={{ height: '72px', borderRadius: '12px', display: 'block' }} />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute', top: '4px', right: '4px',
              background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none',
              borderRadius: '50%', width: '22px', height: '22px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        {/* Attach image */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '42px', height: '42px', borderRadius: '50%', border: 'none',
            background: 'var(--bg-subtle)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-coral-light)'; e.currentTarget.style.color = 'var(--accent-coral)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Attach Image"
        >
          <ImageIcon size={19} />
        </button>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="input-field"
          style={{
            flex: 1, borderRadius: '24px', padding: '12px 18px',
            backgroundColor: 'var(--bg-main)',
            border: '1.5px solid var(--border-color)',
          }}
        />

        {/* Mic —— shows when input is empty */}
        {!text.trim() && !selectedImage ? (
          <button
            type="button"
            onClick={startRecording}
            style={{
              width: '44px', height: '44px', borderRadius: '50%', border: 'none',
              background: 'linear-gradient(135deg, #54c250, #3F8F82)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(84,194,80,0.38)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(84,194,80,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(84,194,80,0.38)'; }}
            title="Record voice message"
          >
            <Mic size={20} />
          </button>
        ) : (
          /* Send button */
          <button
            type="submit"
            disabled={uploading || (!text.trim() && !selectedImage)}
            style={{
              width: '44px', height: '44px', borderRadius: '50%', border: 'none',
              background: (!text.trim() && !selectedImage) || uploading
                ? 'var(--bg-subtle)'
                : 'linear-gradient(135deg, var(--accent-coral), #e05a40)',
              color: (!text.trim() && !selectedImage) || uploading ? 'var(--text-muted)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (!text.trim() && !selectedImage) || uploading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              boxShadow: (!text.trim() && !selectedImage) || uploading ? 'none' : '0 4px 16px rgba(226,114,91,0.4)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => { if (!uploading && (text.trim() || selectedImage)) e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {uploading ? <Loader2 size={20} className="spin-loader" /> : <Send size={18} />}
          </button>
        )}
      </form>
    </div>
  );
}
