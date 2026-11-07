export type Label = {
  id: string
  name: string
  type: 'system' | 'user'
  messageListVisibility: string | null
  labelListVisibility: string | null
}

export async function fetchLabels(): Promise<Label[]> {
  const response = await fetch('/api/labels')
  if (!response.ok) {
    throw new Error(`Could not load labels (HTTP ${response.status})`)
  }
  return response.json()
}
