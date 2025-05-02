import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const Certification = () => {
  const [certificateStatus, setCertificateStatus] = useState<'none' | 'uploaded'>('none');
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setCertificateStatus('uploaded');
      setShowModal(true);
    }
  };

  const checkStatus = () => {
    setShowModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-green-800 mb-6">Certification</h2>
        
        {certificateStatus === 'none' ? (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload your certification document</p>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                accept=".pdf,.doc,.docx"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              disabled={!file}
            >
              <Upload className="w-5 h-5" />
              Upload Certificate
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={checkStatus}
              className="bg-green-100 text-green-800 px-4 py-2 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center gap-2 w-full"
            >
              <CheckCircle2 className="w-5 h-5" />
              Check Certificate Status
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            {certificateStatus === 'uploaded' ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Certificate Uploaded!</h3>
                <p className="text-gray-600 mb-4">Your certificate has been successfully uploaded and is under review.</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Certificate Found</h3>
                <p className="text-gray-600 mb-4">Please upload your certification document.</p>
              </>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certification;