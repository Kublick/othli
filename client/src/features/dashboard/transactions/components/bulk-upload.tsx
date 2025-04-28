import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";

type Props = {
  onUpload: (results: any) => void;
};

const BulkUpload = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();

  return (
    <div>
      <CSVReader onUploadAccepted={onUpload}>
        {({ getRootProps }: any) => (
          <Button {...getRootProps()}>
            <Upload />
            Importar
          </Button>
        )}
      </CSVReader>
    </div>
  );
};

export default BulkUpload;
