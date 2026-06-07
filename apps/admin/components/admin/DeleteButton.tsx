'use client'

interface DeleteButtonProps {
  id: string
  message: string
}

export default function DeleteButton({ id, message }: DeleteButtonProps) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!confirm(message)) {
      e.preventDefault()
    }
  }

  return (
    <button
      id={`delete-btn-${id}`}
      type="submit"
      onClick={handleClick}
      className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
    >
      حذف
    </button>
  )
}
