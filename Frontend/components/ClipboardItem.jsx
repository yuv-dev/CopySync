
export default function ClipboardItem({ text, timestamp }) {
  return (
    <div className="p-4 bg-white rounded shadow mb-2 transition transform hover:scale-105">
      <p className="text-gray-800">{text}</p>
      <span className="text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</span>
    </div>
  );
}
