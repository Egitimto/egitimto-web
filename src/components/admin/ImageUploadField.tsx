import Image from 'next/image'

export function ImageUploadField({
  name,
  label,
  currentUrl,
}: {
  name: string
  label: string
  currentUrl?: string | null
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-body-text">
        {label}
      </label>
      {currentUrl && (
        <Image
          src={currentUrl}
          alt=""
          width={120}
          height={120}
          className="mt-2 rounded-lg object-cover"
          unoptimized
        />
      )}
      <input id={name} name={name} type="file" accept="image/*" className="mt-2 block w-full text-sm" />
    </div>
  )
}
