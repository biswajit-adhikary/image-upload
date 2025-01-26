import ImageUpload from "@/components/BlobUpload";
import FileUpload from "@/components/FileUpload";
import NewUpload from "@/components/newUpload";

export default function Home() {
  return (
    <>
      {/* <FileUpload /> */}
      <ImageUpload />
      <NewUpload />
    </>
  );
}
