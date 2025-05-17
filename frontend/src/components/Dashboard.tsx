import Header from "./ChatInterface"
import UploadSection from "./UploadSection";


export default function Dashboard() {
  return (
    // compile for all routings 
    <div className="flex flex-col items-center justify-center">
      <Header />
      <div className=" w-full p-10"> 
        <UploadSection />
      </div>
    </div>
  );
}
