/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 *
 * @param data     - Array of records to export
 * @param filename - Download filename (without extension)
 */
export function exportToCsv<T extends object>(data: T[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = (row as Record<string, unknown>)[h]
        const str =
          val === null || val === undefined ? "" : Array.isArray(val) ? val.join("; ") : String(val)
        // Wrap in quotes if the value contains a comma, quote, or newline
        return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
      })
      .join(","),
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
