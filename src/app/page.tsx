import HomePageClient from "@/components/other/HomePageClient";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <HomePageClient />
    </div>
  );
}
