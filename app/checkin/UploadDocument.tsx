import { useState } from "react";
import { ArrowBack, Close, CloudUpload, Lock, Shield } from "@mui/icons-material";
import { Option, Select } from "@mui/joy";
import { secureIcon } from "@/app/assets/icons";

type BookingDataType = {
  booking_id: string;
  checkin: string;
  checkout: string;
  guest_email: string;
  meal_veg: number;
  meal_non_veg: number;
  remarks: string;
  additional_info: string;
  room: string;
  breakfast: number;
  document_url: string;
  name: string;
  phone: string;
  company: string;
  vessel: string;
  rank: string;
  id: string;
};

interface UploadDocumentProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  room: string;
  setSelectedBooking: React.Dispatch<React.SetStateAction<BookingDataType>>;
  selectedBooking: BookingDataType;
}

export default function UploadDocument({
  step,
  setStep,
  room,
  setSelectedBooking,
  selectedBooking,
}: UploadDocumentProps) {
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setFilePreview(URL.createObjectURL(file)); // Generate a preview URL
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  // Check if form is complete
  const isFormComplete = documentType && uploadedFile;

  return (
    <div className="m-4">
      <div className="">
        <div className="my-6 mb-4 font-semibold text-lg text-slate-700">
          You{"'"}re just one step away from a free gift!{" "}
          <span className="text-red-600 font-bold">Upload your email and document</span> to complete
          check-in.
        </div>
        <div className="text-red-600 font-semibold">Enter your Email</div>
        <input
          type="text"
          value={selectedBooking.guest_email}
          onChange={(e) => {
            setSelectedBooking({
              ...selectedBooking,
              guest_email: e.target.value,
            });
          }}
          className="p-3 border w-full my-4 focus:outline-none rounded-xl"
        />
        <div className="text-red-600 mt-2 mb-4 font-semibold">Enter your Document</div>
        <Select
          size="lg"
          placeholder="Choose Document Type"
          value={documentType}
          onChange={(e, newValue) => setDocumentType(newValue)}
        >
          <Option value="aadhar">Aadhar Card</Option>
          <Option value="passport">Passport</Option>
          <Option value="dl">Driving License</Option>
          <Option value="other">Other</Option>
        </Select>

        {documentType && (
          <>
            <div className="my-4 font-semibold">Document</div>
            {!uploadedFile && (
              <div
                onClick={() => {
                  document.getElementById("fileInput")?.click();
                }}
                className="mb-4 text-slate-600 w-full border p-4 rounded-xl flex justify-between items-center"
              >
                <label className="cursor-pointer">Upload file or take a photo</label>
                <CloudUpload className="text-slate-600" />
              </div>
            )}
            <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
            {/* Display uploaded file preview if a file is uploaded */}
            {uploadedFile && (
              <div className="flex justify-between my-5 items-center">
                <div className="flex gap-x-4 items-center">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt={documentType}
                      className="rounded-xl h-14 w-14 object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                      No Preview
                    </div>
                  )}
                  <div className="">
                    <div className="font-semibold text-slate-800">
                      {documentType || "Document Type"}
                    </div>
                    <div className="text-sm text-slate-600">{uploadedFile.name}</div>
                  </div>
                </div>
                <div onClick={handleFileRemove} className="cursor-pointer">
                  <Close className="text-slate-600" />
                </div>
              </div>
            )}
            <div className=" my-2 text-slate-500 text-xs inline-flex items-center gap-x-1 font-medium">
              {" "}
              {secureIcon} Your documents are encrypted and securely stored, accessed only by
              authorized personnel.
            </div>
          </>
        )}
        <div className="flex gap-x-2">
          <button
            onClick={() => {
              setStep(step - 1);
            }}
            className="my-6 w-full inline-flex justify-center space-x-2 disabled:bg-gray-300 disabled:text-gray-400 text-red-500 border-red-500 border rounded-2xl font-semibold p-4 text-center bg-white"
          >
            <ArrowBack fontSize="medium" className="" />
            <div>Back</div>
          </button>
          <button
            onClick={async() => {
              if (uploadedFile) {
                try {
                  const res = await uploadDocument(uploadedFile, "hello");
                  console.log("res: ", res)
                } catch(error) {
                  console.log("error: ", error)
                }
              }
            }}
            disabled={!isFormComplete}
            className="my-6 w-full disabled:bg-gray-300 disabled:text-gray-400 text-white rounded-2xl font-semibold p-4 text-center bg-red-500"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
