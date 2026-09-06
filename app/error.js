'use client';

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col justify-center items-center h-screen font-mono">
      <h2 className="text-xl">Something went wrong</h2>
      <button
        onClick={() => reset()}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
