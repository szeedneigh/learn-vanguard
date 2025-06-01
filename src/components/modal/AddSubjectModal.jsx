import React from 'react';
import PropTypes from 'prop-types';

const AddSubjectModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">Add Subject</h2>
        {/* Form elements will go here */}
        <p>Add subject form will be here.</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            type="button"
          >
            Cancel
          </button>
          <button
            // onClick={handleSubmit} // TODO: Implement submit handler
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            type="submit"
          >
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
};

AddSubjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export { AddSubjectModal }; 