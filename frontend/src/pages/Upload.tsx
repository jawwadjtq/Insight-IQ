import { useState } from "react";
import { uploadDataset } from "../services/uploadService";

export default function Upload() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const data = await uploadDataset(file);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Upload Dataset</h1>

      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleUpload}
      />

      {loading && <p>Uploading...</p>}

      {result && (
        <pre className="bg-slate-900 p-4 rounded-xl overflow-auto text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}