/** Saf dizi sıralama — UI sürükle-bırak için (SRP). */
export function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return arr;
  const out = [...arr];
  const [item] = out.splice(fromIndex, 1);
  out.splice(toIndex, 0, item);
  return out;
}
