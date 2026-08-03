import { CircleUserRound, Mail, Shield, Code2 } from "lucide-react";

function ProfilePanel() {
  return (
    <div className="w-72 h-full bg-slate-900 border-r border-slate-700 text-white">
      <div className="p-4 border-b border-slate-700 font-semibold">
        👤 Profile
      </div>

      <div className="flex flex-col items-center p-6">

        <CircleUserRound size={80} className="text-slate-400 mb-4" />

        <h2 className="text-xl font-bold">Developer</h2>

        <p className="text-slate-400 text-sm">
          Offline Code Editor
        </p>

      </div>

      <div className="px-5 space-y-4">

        <div className="flex items-center gap-3">
          <Mail size={18} />
          <span>developer@example.com</span>
        </div>

        <div className="flex items-center gap-3">
          <Shield size={18} />
          <span>Standard User</span>
        </div>

        <div className="flex items-center gap-3">
          <Code2 size={18} />
          <span>React • Express • MongoDB</span>
        </div>

      </div>
    </div>
  );
}

export default ProfilePanel;