export default function LoginError({ message }: { message: string | null }) {
  if (message) {
    return (
      <div className="rounded-md bg-red-100 p-4">
        <h3 className="text-sm font-medium text-red-800">{message}</h3>
      </div>
    )
  } else {
    return null
  }
}
