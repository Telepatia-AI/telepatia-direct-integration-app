'use client'

import { useTelepatia } from '../../context/TelepatiaContext'

export default function ErrorModal() {
  const { errorMessage, setShowErrorModal } = useTelepatia()

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
        <p className="text-gray-700 mb-6">
          {errorMessage}
        </p>
        <button
          onClick={() => setShowErrorModal(false)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}