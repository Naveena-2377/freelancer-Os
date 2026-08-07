import { Upload, FileText } from "lucide-react";

export default function FileUploadStub() {
  return (
    <div>
      <label className="text-xs text-muted mb-1.5 block">Files</label>
      <div className="border border-dashed border-border rounded-lg p-5 text-center">
        <Upload size={18} className="text-muted mx-auto mb-2" />
        <p className="text-xs text-muted">
          File uploads coming soon
        </p>
        <p className="text-xs text-muted/60 mt-1">
          You'll be able to attach briefs, contracts, and deliverables here
        </p>
      </div>
    </div>
  );
}