export default function EnterRoomNo({
  step,
  setStep,
  room,
  setRoom,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  room: string;
  setRoom: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div>
      <div className="mt-4 px-4">
        <div className="font-semibold text-2xl text-r">Welcome to Anchorage!</div>
        <div className="my-4 text-slate-600 font-semibold ">Complete your check-in to receive a special gift on us!</div>
        <div className="text-red-600 font-semibold">Enter your Room Number</div>
        <form
          onSubmit={() => {
            setStep(step + 1);
          }}
        >
          <input
            type="number"
            value={room}
            onChange={(e) => {
              setRoom(e.target.value);
            }}
            className="p-4 border w-full my-4 outline outline-slate-300 rounded-xl"
          />
          <button
            type="submit"
            className="my-6 w-full disabled:bg-gray-300 disabled:text-gray-400 text-white rounded-2xl font-semibold p-4 text-center bg-red-500"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
