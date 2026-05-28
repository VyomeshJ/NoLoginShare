import { Suspense } from "react";
import PasswordCheck from "../../components/passwordCheck";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordCheck />
    </Suspense>
  );
}