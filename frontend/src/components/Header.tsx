import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header>
      <div className=" flex flex-col items-center justify-center">
        <div className="flex items-center text-center">
              <Leaf className="h-10 w-10 text-emerald-600" />
              <h1 className="ml-3 text-3xl font-bold text-gray-900">EcoPatent Analyzer</h1>
        </div>
        <p className="text-gray-600 max-w-3xl p-3">
          Upload a patent document to start asking questions about it. continue some other descriptions...
        </p>
      </div>
    </header>
  );
}