export function PdfDownloadButton({
  url,
  label,
  unavailableLabel,
}: {
  url: string | null
  label: string
  unavailableLabel: string
}) {
  if (!url) {
    return (
      <span className="inline-block cursor-not-allowed rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-400">
        {unavailableLabel}
      </span>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="gradient-primary inline-block rounded-full px-5 py-2 text-sm font-semibold text-white"
    >
      {label}
    </a>
  )
}
