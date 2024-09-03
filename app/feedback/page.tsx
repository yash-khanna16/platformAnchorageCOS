import Feedback from "../components/Feedback";

function FeedbackPage({ searchParams }: { searchParams: { booking_id?: string } }) {

  return (
    <Feedback searchParams={searchParams} />
  );
}

export default FeedbackPage;
