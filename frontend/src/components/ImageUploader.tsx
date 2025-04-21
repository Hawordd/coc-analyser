import type React from 'react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../index.css';

const ImageUploader: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  // Définition du type attendu pour le résultat (à ajuster selon votre API)
  interface AnalyzeResult {
    width: number;
    height: number;
    buildings?: { type: string; level: number; bbox: [number, number, number, number] }[];
  }

  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        <div className="preview-container">
          <img src={preview} alt="Preview" className="preview-image" />
          
          {result && (
            <div className="result-container">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;