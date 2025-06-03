import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const FloatingUploadButton = ({ setIsModalOpen }) => {
  return (
    <div className="fixed bottom-6 right-6">
      <Button onClick={() => setIsModalOpen(true)} className="shadow-lg" size="lg">
        <Upload className="w-5 h-5 mr-2" />
        Upload File
      </Button>
    </div>
  )
}

FloatingUploadButton.propTypes = {
  setIsModalOpen: PropTypes.func.isRequired,
}

export default FloatingUploadButton; 