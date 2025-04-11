const PreviewSection = () => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Project Preview</h2>
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img 
          src="https://placehold.co/1920x1080/e2e8f0/475569/png?text=Project+Preview" 
          alt="Project Preview"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default PreviewSection