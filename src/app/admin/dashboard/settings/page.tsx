import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordClient from "./ChangePasswordClient";

export const metadata = {
  title: "Settings | Yusdaam Admin",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // Extra safety check to ensure only Admins can view this page
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Admin Settings</h1>
        <p className="text-sm text-gray-400">Manage your security preferences and account settings.</p>
      </div>

      <div className="mt-8">
        <ChangePasswordClient />
      </div>
    </div>
  );
}
