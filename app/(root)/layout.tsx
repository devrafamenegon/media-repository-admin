import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SetupLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) redirect('/sign-in');

  return (
    <>
      {children}
    </>
  )
}