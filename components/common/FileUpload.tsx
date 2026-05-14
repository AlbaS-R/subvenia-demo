
import React, {useCallback} from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onFileSelect(files);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      onFileSelect(event.dataTransfer.files);
    }
  }, [onFileSelect]);
  
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
      <div 
        className="glass-panel flex justify-center px-6 pt-5 pb-6 border-2 border-white/15 border-dashed rounded-2xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="space-y-1 text-center">
          <span className="material-symbols-outlined mx-auto text-5xl leading-none text-primary">upload</span>
          <div className="flex text-base text-neutral-300 font-roboto">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
            >
              <span className="font-poppins">{t('fileUpload.upload')}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
            </label>
            <p className="pl-1">{t('fileUpload.drag')}</p>
          </div>
          <p className="text-base text-neutral-400 font-roboto">{t('fileUpload.types')}</p>
        </div>
      </div>
  );
};
