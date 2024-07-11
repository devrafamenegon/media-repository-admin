import Navbar from "@/components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) redirect('/sign-in');

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}