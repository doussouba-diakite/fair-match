"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh(); // re-render the header without the logged-in links
  }
  return <button className="linklike" onClick={logout}>Log out</button>;
}
