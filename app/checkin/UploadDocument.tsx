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
  const [uploadedFileFront, setUploadedFileFront] = useState<File | null>(null);
  const [uploadedFileBack, setUploadedFileBack] = useState<File | null>(null);
  const [filePreviewFront, setFilePreviewFront] = useState<string | null>(null);
  const [filePreviewBack, setFilePreviewBack] = useState<string | null>(null);
  const [uploadLoadingFront, setUploadLoadingFront] = useState(false);
  const [uploadLoadingBack, setUploadLoadingBack] = useState(false);
  const [documentURLFront, setDocumentURLFront] = useState<string | null>(null);
  const [documentURLBack, setDocumentURLBack] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChangeFront = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        setUploadLoadingFront(true);

        // Create FormData and append file and name
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", selectedBooking.booking_id + "_" + documentType);

        const res = await uploadDocument(formData);
        setDocumentURLFront(res);
        setUploadLoadingFront(false);
        setAlert(true);
        setMessage("Doucment Uploaded Successfully!");
        setUploadedFileFront(file);
        setFilePreviewFront(URL.createObjectURL(file)); // Generate a preview URL
      } catch (error) {
        setUploadLoadingFront(false);
        setAlert(true);
        console.log("error: ", error);
        setMessage("Something went wrong! Please try again later.");
      }
    }
  };

  // Handle file removal
  const handleFileRemoveFront = () => {
    setUploadedFileFront(null);
    setFilePreviewFront(null);
    setDocumentURLFront(null);
  };
  const handleFileChangeBack = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const file = e.target.files[0];
        setUploadLoadingBack(true);

        // Create FormData and append file and name
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", selectedBooking.booking_id + "_" + documentType + "_back");

        const res = await uploadDocument(formData);
        setDocumentURLBack(res);
        setUploadLoadingBack(false);
        setAlert(true);
        setMessage("Doucment Uploaded Successfully!");
        setUploadedFileBack(file);
        setFilePreviewBack(URL.createObjectURL(file)); // Generate a preview URL
      } catch (error) {
        setUploadLoadingBack(false);
        setAlert(true);
        setMessage("Something went wrong! Please try again later.");
      }
    }
  };

  // Handle file removal
  const handleFileRemoveBack = () => {
    setUploadedFileBack(null);
    setFilePreviewBack(null);
    setDocumentURLBack(null);
  };

  // Check if form is complete
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isBothFrontAndBack = documentType === "aadhar" || documentType === "other";

  const isFormComplete: boolean =
    !!documentType &&
    emailPattern.test(selectedBooking.guest_email) &&
    (isBothFrontAndBack
      ? !!(uploadedFileFront && documentURLFront && uploadedFileBack && documentURLBack)
      : !!(uploadedFileFront && documentURLFront));

  return (
    <div className="m-4">
      <div className="">
        <div className="my-6 mb-4 font-semibold text-lg text-slate-700">
          <div className="">Hi, {selectedBooking.name}</div>
          <div className=" mt-2">
            <span className="text-red-600 font-bold"> Enter your email</span> and{" "}
            <span className="text-red-600 font-bold">upload ID</span> to complete check-in for a reward!
          </div>
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
          onChange={(e, newValue) => {
            setDocumentType(newValue);
            handleFileRemoveBack();
            handleFileRemoveFront();
          }}
        >
          <Option value="aadhar">Aadhar Card</Option>
          <Option value="passport">Passport</Option>
          <Option value="dl">Driving License</Option>
          <Option value="other">Other</Option>
        </Select>

        {documentType && (
          <div className="mt-8">
            {isBothFrontAndBack && (
              <>
                {!uploadedFileFront && (
                  <>
                    <div className="my-4 font-semibold mx-1">Front Side</div>
                    {!uploadLoadingFront && (
                      <>
                        <div
                          onClick={() => {
                            document.getElementById("fileInputFront")?.click();
                          }}
                          className="mb-4 text-slate-600 w-full border p-4 rounded-xl flex justify-between items-center"
                        >
                          <label className="cursor-pointer">Upload file or take a photo</label>
                          <CloudUpload className="text-slate-600" />
                        </div>
                      </>
                    )}
                    {uploadLoadingFront && (
                      <div className="mt-6 flex justify-center space-x-3 items-center">
                        <LinearProgress size="md" />
                      </div>
                    )}
                  </>
                )}
                {uploadedFileFront && (
                  <div className="flex justify-between my-5 items-center">
                    <div className="flex gap-x-4 items-center">
                      {filePreviewFront ? (
                        <img src={filePreviewFront} alt={documentType} className="rounded-xl h-14 w-14 object-cover" />
                      ) : (
                        <div className="h-14 w-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                          No Preview
                        </div>
                      )}
                      <div className="">
                        <div className="font-semibold text-slate-800 capitalize">
                          {documentType + " Front" || "Document Type"}
                        </div>
                        <div className="text-sm text-slate-600">{uploadedFileFront.name}</div>
                      </div>
                    </div>
                    <div onClick={handleFileRemoveFront} className="cursor-pointer">
                      <Close className="text-slate-600" />
                    </div>
                  </div>
                )}
                {!uploadedFileBack && (
                  <>
                    <div className="my-4 font-semibold mx-1">Back Side</div>
                    {!uploadedFileBack && !uploadLoadingBack && (
                      <>
                        <div
                          onClick={() => {
                            document.getElementById("fileInputBack")?.click();
                          }}
                          className="mb-4 text-slate-600 w-full border p-4 rounded-xl flex justify-between items-center"
                        >
                          <label className="cursor-pointer">Upload file or take a photo</label>
                          <CloudUpload className="text-slate-600" />
                        </div>
                      </>
                    )}
                    {uploadLoadingBack && (
                      <div className="mt-6 flex justify-center space-x-3 items-center">
                        <LinearProgress size="md" />
                      </div>
                    )}
                  </>
                )}
                {uploadedFileBack && (
                  <div className="flex justify-between my-5 items-center">
                    <div className="flex gap-x-4 items-center">
                      {filePreviewBack ? (
                        <img src={filePreviewBack} alt={documentType} className="rounded-xl h-14 w-14 object-cover" />
                      ) : (
                        <div className="h-14 w-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                          No Preview
                        </div>
                      )}
                      <div className="">
                        <div className="font-semibold text-slate-800 capitalize">{documentType + " Back" || "Document Type"}</div>
                        <div className="text-sm text-slate-600">{uploadedFileBack.name}</div>
                      </div>
                    </div>
                    <div onClick={handleFileRemoveBack} className="cursor-pointer">
                      <Close className="text-slate-600" />
                    </div>
                  </div>
                )}
              </>
            )}
            {!isBothFrontAndBack && (
              <>
                {!uploadedFileFront && (
                  <>
                    <div className="my-4 font-semibold">Document</div>
                    {!uploadLoadingFront && (
                      <>
                        <div
                          onClick={() => {
                            document.getElementById("fileInputFront")?.click();
                          }}
                          className="mb-4 text-slate-600 w-full border p-4 rounded-xl flex justify-between items-center"
                        >
                          <label className="cursor-pointer">Upload file or take a photo</label>
                          <CloudUpload className="text-slate-600" />
                        </div>
                      </>
                    )}
                    {uploadLoadingFront && (
                      <div className="mt-6 flex justify-center space-x-3 items-center">
                        <LinearProgress size="md" />
                      </div>
                    )}
                  </>
                )}
                {uploadedFileFront && (
                  <div className="flex justify-between my-5 items-center">
                    <div className="flex gap-x-4 items-center">
                      {filePreviewFront ? (
                        <img src={filePreviewFront} alt={documentType} className="rounded-xl h-14 w-14 object-cover" />
                      ) : (
                        <div className="h-14 w-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                          No Preview
                        </div>
                      )}
                      <div className="">
                        <div className="font-semibold text-slate-800 capitalize">{documentType || "Document Type"}</div>
                        <div className="text-sm text-slate-600">{uploadedFileFront.name}</div>
                      </div>
                    </div>
                    <div onClick={handleFileRemoveFront} className="cursor-pointer">
                      <Close className="text-slate-600" />
                    </div>
                  </div>
                )}
              </>
            )}
            <input type="file" id="fileInputFront" className="hidden" onChange={handleFileChangeFront} />
            <input type="file" id="fileInputBack" className="hidden" onChange={handleFileChangeBack} />
            {/* Display uploaded file preview if a file is uploaded */}

            <div className=" my-2 text-slate-500 text-xs inline-flex items-center gap-x-1 font-medium">
              {secureIcon} Your documents are encrypted and securely stored, accessed only by authorized personnel.
            </div>
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
              if (isFormComplete) {
                try {
                  setLoading(true);
                  const res = await checkinGuest(
                    selectedBooking.booking_id,
                    documentURLFront,
                    selectedBooking.guest_email,
                    room,
                    selectedBooking.name,
                    documentURLBack
                  );
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
