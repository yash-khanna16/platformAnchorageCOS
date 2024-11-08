import { useState } from "react";
import { ArrowBack, Close, CloudUpload, Info, Lock, Shield } from "@mui/icons-material";
import { CircularProgress, LinearProgress, Option, Select, Snackbar } from "@mui/joy";
import { secureIcon } from "@/app/assets/icons";
import { uploadDocument } from "../actions/uploadDocument";
import { checkinGuest } from "../actions/api";
import { createToken } from "../actions/util";
import { setAuthCustomer } from "../actions/cookie";

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

export default function UploadDocument({ step, setStep, room, setSelectedBooking, selectedBooking }: UploadDocumentProps) {
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentURL, setDocumentURL] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        setUploadLoading(true);
        const res = await uploadDocument(file, selectedBooking.booking_id + "_" + documentType);
        setDocumentURL(res);
        setUploadLoading(false);
        setAlert(true);
        setMessage("Doucment Uploaded Successfully!");
        setUploadedFile(file);
        setFilePreview(URL.createObjectURL(file)); // Generate a preview URL
      } catch (error) {
        setUploadLoading(false);
        setAlert(true);
        setMessage("Something went wrong! Please try again later.");
      }
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setDocumentURL(null);
  };

  // Check if form is complete
  const isFormComplete = documentType && uploadedFile && documentURL;

  return (
    <div className="m-4">
      <div className="">
        <div className="my-6 mb-4 font-semibold text-lg text-slate-700">
          Almost there!
          <span className="text-red-600 font-bold"> Enter your email and upload ID</span> to complete check-in for a reward!
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
        <div className="text-red-600 mt-2 mb-1 font-semibold">Upload ID</div>
        <div className="text-xs mb-2">Please ensure that your document is clearly visible.</div>
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

        {documentType && !uploadLoading && (
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
                    <img src={filePreview} alt={documentType} className="rounded-xl h-14 w-14 object-cover" />
                  ) : (
                    <div className="h-14 w-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                      No Preview
                    </div>
                  )}
                  <div className="">
                    <div className="font-semibold text-slate-800">{documentType || "Document Type"}</div>
                    <div className="text-sm text-slate-600">{uploadedFile.name}</div>
                  </div>
                </div>
                <div onClick={handleFileRemove} className="cursor-pointer">
                  <Close className="text-slate-600" />
                </div>
              </div>
            )}
            <div className=" my-2 text-slate-500 text-xs inline-flex items-center gap-x-1 font-medium">
              {secureIcon} Your documents are encrypted and securely stored, accessed only by authorized personnel.
            </div>
          </>
        )}
        {uploadLoading && (
          <div className="mt-6 flex justify-center space-x-3 items-center">
            <LinearProgress size="md" />
          </div>
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
            onClick={async () => {
              if (uploadedFile && documentURL) {
                try {
                  setLoading(true);
                  const res = await checkinGuest(selectedBooking.booking_id, documentURL, selectedBooking.guest_email, room, selectedBooking.name);
                  const token = await createToken(selectedBooking, "2h");
                  setAuthCustomer(token);
                  setLoading(false);
                  setStep(step + 1);
                } catch (error) {
                  console.log("error: ", error);
                  setLoading(false);
                  setAlert(true);
                  setMessage("Something went wrong! Please try again later.");
                }
              }
            }}
            disabled={!isFormComplete || loading}
            className="my-6 w-full disabled:bg-gray-300 gap-x-3 flex items-center justify-center disabled:text-gray-400 text-white rounded-2xl font-semibold p-4 text-center bg-red-500"
          >
            Finish {loading && <CircularProgress size="sm" color="neutral" />}
          </button>
        </div>
      </div>
      <Snackbar
        open={alert}
        autoHideDuration={5000}
        // color="danger"
        onClose={() => {
          setAlert(false);
        }}
      >
        <div className="flex justify-between w-full ">
          <div>
            <Info className="mr-1" />
            {message}
          </div>
          <div onClick={() => setAlert(false)} className="cursor-pointer hover:bg-[#f3eded]">
            <Close className="ml-1" />
          </div>
        </div>
      </Snackbar>
    </div>
  );
}
