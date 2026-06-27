"use client"

import { useState } from "react"

type Props = {
  images: string[]
  title?: string
  primary: string
}

export function Gallery({ images, title, primary }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = () => setLightbox(i => i !== null ? (i - 1 + images.length) % images.length : null)
  const next = () => setLightbox(i => i !== null ? (i + 1) % images.length : null)

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 12,
      }}>
        {images.map((src, i) => (
          <div key={i} onClick={() => setLightbox(i)} style={{
            borderRadius: 16, overflow: "hidden", cursor: "zoom-in",
            aspectRatio: "4/3", position: "relative",
            background: "#1e293b",
          }}>
            <img
              src={src}
              alt={`Galeri ${i + 1}`}
              loading="lazy"
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.4s ease, filter 0.3s",
                display: "block",
              }}
              onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = "scale(1.06)"; (e.target as HTMLImageElement).style.filter = "brightness(1.1)" }}
              onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = "scale(1)"; (e.target as HTMLImageElement).style.filter = "brightness(1)" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0)", transition: "background 0.3s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "rgba(255,255,255,0)", fontSize: 28, transition: "color 0.3s" }}>🔍</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setLightbox(null)}>
          <button onClick={e => { e.stopPropagation(); prev() }} style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
            width: 48, height: 48, borderRadius: "50%", fontSize: 20,
            cursor: "pointer", backdropFilter: "blur(8px)",
          }}>‹</button>

          <img
            src={images[lightbox]}
            alt="Büyütülmüş görsel"
            style={{
              maxWidth: "90vw", maxHeight: "85vh",
              objectFit: "contain", borderRadius: 16,
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            }}
            onClick={e => e.stopPropagation()}
          />

          <button onClick={e => { e.stopPropagation(); next() }} style={{
            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
            width: 48, height: 48, borderRadius: "50%", fontSize: 20,
            cursor: "pointer", backdropFilter: "blur(8px)",
          }}>›</button>

          <button onClick={() => setLightbox(null)} style={{
            position: "absolute", top: 20, right: 20,
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
            width: 40, height: 40, borderRadius: "50%", fontSize: 18,
            cursor: "pointer",
          }}>✕</button>

          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
          }}>{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </>
  )
}
