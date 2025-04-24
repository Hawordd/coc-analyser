import type React from 'react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../index.css';

const ImageUploader: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);

  interface Building {
    type: string;
    confidence: number;
    bbox: { x1: number; y1: number; x2: number; y2: number };
  }
  interface AnalyzeResult {
    width: number;
    height: number;
    buildings?: Building[];
  }

  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setPreview(URL.createObjectURL(file));
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:8000/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setResult(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  // Calcule la position des points selon le ratio d'affichage
  const getPoints = () => {
    if (!result?.buildings || !imgRef.current) return [];
    const img = imgRef.current;
    const xRatio = img.width / img.naturalWidth;
    const yRatio = img.height / img.naturalHeight;
    return result.buildings.map(b => {
      // milieu de la bbox
      const x = ((b.bbox.x1 + b.bbox.x2) / 2) * xRatio;
      const y = ((b.bbox.y1 + b.bbox.y2) / 2) * yRatio;
      return { x, y, ...b };
    });
  };

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Glissez-déposez une image ou cliquez pour sélectionner</p>
      </div>

      {isLoading && (
        <div className="text-center my-4">
          <p>Analyse en cours...</p>
        </div>
      )}

      {preview && (
        <div className="preview-container" style={{ position: 'relative', display: 'inline-block' }}>
          <img
            ref={imgRef}
            src={preview}
            alt="Preview"
            className="preview-image"
            id="analyzed-image"
            style={{ width: '100%', maxWidth: 600, display: 'block' }}
            onLoad={() => setHoveredIdx(null)}
          />
          {/* Points sur les bâtiments */}
          {result?.buildings && imgRef.current && getPoints().map((pt, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: pt.x - 7,
                top: pt.y - 7,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#1a73e8',
                border: '2px solid #fff',
                boxShadow: '0 0 4px #0008',
                cursor: 'pointer',
                zIndex: 2,
                transition: 'transform 0.1s',
                transform: hoveredIdx === idx ? 'scale(1.3)' : 'scale(1)'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {hoveredIdx === idx && (
                <div
                  style={{
                    position: 'absolute',
                    left: '110%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#fff',
                    color: '#222',
                    border: '1px solid #1a73e8',
                    borderRadius: 6,
                    padding: '8px 12px',
                    minWidth: 140,
                    boxShadow: '0 2px 8px #0002',
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <strong>{pt.type}</strong><br />
                  Confiance : {(pt.confidence * 100).toFixed(1)}%<br />
                  x: {Math.round(pt.bbox.x1)}, y: {Math.round(pt.bbox.y1)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;